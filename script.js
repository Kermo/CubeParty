var cubes = {
	"scale": 20,
	"width": 10,
	"height": 10,
	"grabbed": null,
	"cubes": [],
	"k": 0.01,
	"damp": 1.00,
	"margin": -20
};

var r3 = Math.sqrt(3);
var hr3 = r3/2;

(function() {
	var lastTime = 0;

	var vendors = ['ms', 'moz', 'webkit', 'o'];

	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];

	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());


function rgbString(r, g, b) {
	return "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")";
}

function isoCube(ctx, s, c) {
	ctx.beginPath();

	if(c.grabbed) {
		ctx.fillStyle = rgbString(0, 0, 255);
	} else {
		
		// TODO: Add offset value
		var r = 0;
		var g = 191 - 80 * c.off;
		var b = 255 - 80 * c.off;
		ctx.fillStyle = rgbString(r, g, b);
	}

	ctx.moveTo(0, 0);
    ctx.lineTo(s * hr3,-0.5 * s);
    ctx.lineTo(0, -1 * s);
    ctx.lineTo(-hr3 * s, -0.5 * s);
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = rgbString(0, 0, 255);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 10 * s);
    ctx.lineTo(hr3 * s, 10 * s - 0.5 * s);
    ctx.lineTo(hr3 * s, -0.5 * s);
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = rgbString(0, 191, 255);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 10 * s);
    ctx.lineTo(-hr3 * s, 10 * s - 0.5 * s);
    ctx.lineTo(-hr3 * s, -0.5 * s);
    ctx.lineTo(0, 0);
    ctx.fill();
}

function tick(g) {
	g.frame++;
	g.ctx.setTransform(1, 0, 0, 1, 0, 0);
	g.ctx.clearRect(0, 0, g.canvaswidth, g.canvasheight);
	var k = 0.01;

	g.cubes.forEach(function(c) {
        g.ctx.setTransform(1,0,0,1,0,0);
        g.ctx.translate(hr3 * g.scale + g.margin, g.scale + g.margin);
        g.ctx.translate(g.scale * c.x * r3, g.scale * c.y * 1.5);
        if (c.y % 2 == 1) {
            g.ctx.translate(g.scale * hr3, 0);
        }
        g.ctx.translate(0, c.off * g.scale);
        isoCube(g.ctx, g.scale, c);

        // Update velocities
        var x = c.x; 
        var y = c.y;

        if (x == 0) {
            c.voff -= g.k * c.off;
        } else {
            var n = g.cubes[y * g.width+ x - 1];
            c.voff -= g.k * (c.off - n.off);
        }
        if (x == g.width - 1) {
            c.voff -= g.k * c.off;
        } else {
            var n = g.cubes[y * g.width + x + 1];
            c.voff -= g.k * (c.off - n.off);
        }
        if (y == 0) {
            c.voff -= g.k * c.off;
        } else {
            var n = g.cubes[(y - 1) * g.width + x];
            c.voff -= g.k * (c.off - n.off);
        }
        if (y == g.height - 1) {
            c.voff -= g.k * c.off;
        } else {
            var n = g.cubes[(y + 1) * g.width + x];
            c.voff -= g.k * (c.off - n.off);
        }
        c.voff *= g.damp;
        
    });
    // 2nd pass update positions
    g.cubes.forEach(function(c) {
        c.off += c.voff;
    });
    if (g.grabbed != null) {
        g.grabbed.off = (g.mouseY - g.grabY) / g.scale;
        g.grabbed.voff = 0;
    }
}

function initcubes(g) {
	g.cubes = [];
	for (var y = 0; y < g.height; y++) {
		for (var x = 0; x < g.width; x++) {
			var c = {
				"x": x,
				"y": y,
				"off": 0.0,
				"voff": 0.0,
				"grabbed": false
			};

			g.cubes.push(c);
		}
	}
}

function init() {
	var canvas = document.getElementById("thecanvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	window.onmousedown = function(evt) {
		cubes.grabX = evt.clientX;
		cubes.grabY = evt.clientY;
		cubes.mouseX = evt.clientX;
		cubes.mouseY = evt.clientY;

		var gY = Math.floor((cubes.mouseY - cubes.margin) / (1.5 * cubes.scale));
		var gXt = (cubes.mouseX - cubes.margin) / (r3* cubes.scale);
		var gX = gY % 2 == 1 ? Math.floor(gXt - 0.5 ) : Math.floor(gXt);

		if (gX >= 0 && gX < cubes.width && gY >= 0 && gY < cubes.height) {
			cubes.grabbed = cubes.cubes[gY * cubes.width + gX];
			cubes.grabbed.grabbed = true;
		}
	}

	window.onmousemove = function(evt) {
		cubes.mouseX = evt.clientX;
		cubes.mouseY = evt.clientY;
	}

	window.onmouseup = function(evt) {
		if (cubes.grabbed != null) {
			cubes.grabbed.grabbed = false;
		}

		cubes.grabbed = null;
	}

	window.onresize = function() {
		cancelAnimationFrame(cubes.anim);
		init();
	}

	cubes.ctx = canvas.getContext('2d');
	cubes.canvaswidth = canvas.width;
	cubes.canvasheight = canvas.height;
	cubes.width = Math.ceil(cubes.canvaswidth / (cubes.scale * r3));
	cubes.height = Math.ceil(cubes.canvasheight / (cubes.scale * 1.5));
	cubes.frame = 0;
	initcubes(cubes);
	(function animloop() {
		cubes.anim = requestAnimationFrame(animloop);
		tick(cubes);
	})();
}