var Engine = (
	function()
	{
		var CANVAS_WIDTH = 800;
		var CANVAS_HEIGHT = 600;
		
		var MAX_LAPSE = 100;
		
		var CURRENCY_SYMBOL = "\u00a3";
		
		var logging = true;
		var warning = true;
		var debugging = false;
		var lastTime = null;
		var paused = true;
		
		var canvas;
		var context;
		var canvasBoundingRectangle;
		
		var assets = {};
		var settings = {};
		
		var mousePosition = new Point(0,0);
		var keysPressed = {
			"up":false,	
			"down":false,	
			"left":false,	
			"right":false,
			"shift":false,
		};
		return {
			get CURRENCY_SYMBOL() {return CURRENCY_SYMBOL},
			
			get assets() {return assets;},
			get context() {return context;},
			
			get keysPressed() {return keysPressed;},
			
			get mouseX() {return mousePosition.x;},
			get mouseY() {return mousePosition.y;},
			
			initialize: function()
			{	
				paused = false;
				
				canvas = document.createElement("canvas");
				canvas.width = CANVAS_WIDTH;
				canvas.height = CANVAS_HEIGHT;
				document.body.appendChild(canvas);
				context = canvas.getContext("2d");
				canvasBoundingRectangle = canvas.getBoundingClientRect();
				
				// init canvas 
				context.imageSmoothingEnabled = false;
				// settings 
				settings["notification"] = {};
				settings["notification"]["notify"] = true;
				
				// assets 
				assets = images;
				
				// helper initializing
				State_manager.initialize();
				
				UI_handler.initialize();
				// listeners
				document.body.addEventListener("mousedown",Engine.handle_mousedown, false);
				document.body.addEventListener("mouseup",Engine.handle_mouseup, false);
				document.body.addEventListener("mousemove",Engine.handle_mousemove, false);
				
				document.body.addEventListener("keydown",Engine.handle_keydown, false);
				document.body.addEventListener("keyup",Engine.handle_keyup, false);
				
				window.requestAnimationFrame(Engine.draw);
			},
			
			log: function(message)
			{
				if(logging)
				{
					console.log(message);
				}
			},
			
			warn: function(message)
			{
				if(warning)
				{
					console.warn(message);
				}
			},
			
			notify: function(message)
			{
				if(settings["notification"]["notify"])
				{
					// do whatever to notify the player 
					// temporary logging
					console.log(message);
				}
			},
			
			draw: function(time)
			{
				// reset 
				context.clearRect(0,0,canvas.width,canvas.height);
				context.strokeStyle = "black";
				context.fillStyle = "black";
				// canvas bounds
				context.beginPath();
				context.rect(0,0,canvas.width,canvas.height);
				context.closePath();
				context.stroke();
								
				// draw UI over everything
				UI_handler.draw(context);
				
				// draw the mouse 
				Engine.draw_cursor(mousePosition.x,mousePosition.y);
				// customary ticking and preparation for next tick
				if(!lastTime)
				{
					lastTime = time;
				}
				var lapse = time - lastTime;
				lastTime = time;
				// this prevents lagging that is damaging
				if(lapse > MAX_LAPSE) 
				{
					Engine.log("Engine: Lapse " + lapse + "ms is too high! Setting it back to " + MAX_LAPSE + "ms.");
					lapse = MAX_LAPSE;
				}
				Engine.tick(lapse);
				
				window.requestAnimationFrame(Engine.draw);
			},
			
			tick: function(lapse)
			{
			},
			
			handle_mousedown: function(event)
			{
				var mouseX = event.clientX - canvasBoundingRectangle.x;
				var mouseY = event.clientY - canvasBoundingRectangle.y;
				
				UI_handler.handle_mousedown(mouseX, mouseY);
			},
			
			handle_mouseup: function(event)
			{
				var mouseX = event.clientX - canvasBoundingRectangle.x;
				var mouseY = event.clientY - canvasBoundingRectangle.y;
				
				UI_handler.handle_mouseup(mouseX, mouseY);
			},
			
			handle_mousemove: function(event)
			{
				var mouseX = event.clientX - canvasBoundingRectangle.x;
				var mouseY = event.clientY - canvasBoundingRectangle.y;
				
				mousePosition.x = mouseX;
				mousePosition.y = mouseY;
			},
			
			handle_keydown: function(keyevent)
			{
				var key = keyevent.key;
				if(key.length === 1 || key === "Backspace" || key === "Enter")
				{
					UI_handler.handle_keydown(key);
				}
				// TODO, rehaul from keyevent.keyCode to keyevent.code
				switch(keyevent.keyCode)
				{
					case 37:
					case 65:
						keysPressed["left"] = true;
						break;
					case 39:
					case 68:
						keysPressed["right"] = true;
						break;
					case 40:
					case 83:
						keysPressed["down"] = true;
						break;
					case 38:
					case 87:
						keysPressed["up"] = true;
						break;
					case 16:
						keysPressed["shift"] = true;
						break;
				}
			},
			
			handle_keyup: function(keyevent)
			{
				var key = keyevent.key;
				if(key.length === 1)
				{
					UI_handler.handle_keyup(key);
				}
				// TODO, rehaul from keyevent.keyCode to keyevent.code
				switch(keyevent.keyCode)
				{
					case 37:
					case 65:
						keysPressed["left"] = false;
						break;
					case 39:
					case 68:
						keysPressed["right"] = false;
						break;
					case 40:
					case 83:
						keysPressed["down"] = false;
						break;
					case 38:
					case 87:
						keysPressed["up"] = false;
						break;
					case 16:
						keysPressed["shift"] = false;
						break;
				}
			},
			
			draw_cursor: function(x,y)
			{
				context.beginPath();
				context.moveTo(x,y);
				context.lineTo(x + 15,y + 5);
				context.lineTo(x + 5,y + 15);
				context.closePath();
				context.strokeStyle = "black";
				context.fillStyle = "white";
				context.stroke();
				context.fill();
			},
		}
	}
)();


function create_image(path) 
{
	var image = document.createElement("img");
	image.src = path;

	return image;
}

function KeyNotFoundError(message)
{
	Error.call(this,message);
	this.name = "KeyNotFoundError";
}

KeyNotFoundError.prototype = Error.prototype;
