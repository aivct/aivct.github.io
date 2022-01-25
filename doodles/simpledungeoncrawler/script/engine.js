import Vector from "./utilities/vector.js";
import Renderer from "./renderer.js";
import Dungeon from "./dungeon.js";
import Creature from "./creature.js";
import Player from "./player.js";
import AudioPlayer from "./audio_player.js";
import * as Random from "./utilities/random.js";
import * as Preloader from "./initialize.js";

var mousePosition = {x:0, y:0};
var keysPressed = {
	"up":false,	
	"down":false,	
	"left":false,	
	"right":false,	
	"space":false,
	"sound_toggle": false,
};

var mainRenderer;
var backgroundRenderer;
var spriteRenderer;
var UIRenderer;
var audio;

var currentDungeon;
var inGame = false;
var lastTime;

function drawMain(context, lapse)
{
	backgroundRenderer.repaint(context);
	spriteRenderer.draw(lapse);
	spriteRenderer.repaint(context);
	UIRenderer.draw(lapse);
	UIRenderer.repaint(context);
}

function drawDungeon(context, lapse)
{
	currentDungeon.drawDungeon(context, lapse);
}

function drawSprites(context, lapse)
{
	currentDungeon.drawSprites(context, lapse);
}

// overlaid on existing, so be careful
function drawUI(context, lapse)
{
	if(!inGame)
	{
		if(currentDungeon.gameOver)
		{
			// draw gameover screen 
			context.fillStyle = "black";
			context.fillRect(0,0,800,600);
			context.fillStyle = "white";
			context.font = "12px monospace";
			context.fillText("Game Over", 10, 20);
			context.fillText("Score: " + currentDungeon.floorCount, 10, 40);
			context.fillText("Press SPACE to Continue", 10, 60);
			
			context.fillText("Credits", 10, 100);
			context.fillText("Sound Effects from freesound.org", 10, 120);
			context.fillText("CC0 1.0", 10, 140);
			context.fillText("florianreichelt", 10, 160);
			context.fillText("adcbicycle", 10, 180);
			context.fillText("CC BY 3.0", 10, 200);
			context.fillText("elmasmalo1", 10, 220);
			context.fillText("dersuperanton", 10, 240);
			
			context.fillText("Art, Design, and Programming by Frank Lai", 10, 300);
			context.fillText("Thanks For Playing!", 10, 330);
		}
	}
	else 
	{
		var floorCount = currentDungeon.floorCount;
		context.font = "30px Arial";
		context.fillStyle = "white";
		context.fillText(`${floorCount}`, 800 - 30, 30);
	}
	
	// sound 
	var soundEnabled = audio.isSoundEnabled();
	var image;
	if(soundEnabled)
	{
		image = Preloader.getImage("audio_on");
	}
	else 
	{
		image = Preloader.getImage("audio_off");
	}
	context.drawImage(image, 800 - 40, 600 - 40);
}

function toggleInGame()
{
	inGame = !inGame;
}

function resetGame()
{
	newGame();
}

function initialize()
{
	var canvas = createCanvas(800,600);
	document.body.appendChild(canvas);
	mainRenderer = new Renderer(canvas, [{draw:drawMain}]);
	backgroundRenderer = new Renderer(createCanvas(800,600), [{draw:drawDungeon}]);
	spriteRenderer = new Renderer(createCanvas(800,600), [{draw:drawSprites}]);
	UIRenderer = new Renderer(createCanvas(800,600), [{draw:drawUI}]);
	
	audio = new AudioPlayer(Preloader.getAudioLibrary());
	
	document.body.addEventListener("keydown",handleKeydown, false);
	document.body.addEventListener("keyup",handleKeyup, false);
	
	newGame();
	
	// test 
	// autodungeon
	// setInterval(autoDungeon, 20);
	window.requestAnimationFrame(draw);
}

function createCanvas(width, height)
{
	var canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

function newGame()
{
	currentDungeon = new Dungeon();
	currentDungeon.newLevel();
	inGame = true;
	backgroundRenderer.draw();
}

var lastAction = "down";
function autoDungeon()
{
	// please drunken walk the drunken walk (this or the other comment will become irrelevent by the next patch).
	var actions = ["left","right","up","down"];
	var action = lastAction;
	if(Math.random() < 0.3)
	{
		action = Random.randomElementInArray(actions);
		lastAction = action;
	}
	currentDungeon.handleAction(action);
	backgroundRenderer.draw();
}

function keyTranslate(keyevent)
{
	var keyAction;
	switch(keyevent.keyCode)
	{
		case 37:
		case 65:
			keyAction = "left";
			break;
		case 39:
		case 68:
			keyAction = "right";
			break;
		case 40:
		case 83:
			keyAction = "down";
			break;
		case 38:
		case 87:
			keyAction = "up";
			break;
		case 32:
			keyAction = "space";
			break;
		case 77:
			keyAction = "sound_toggle";
			break;
	}
	if(!keyAction) return null;
	return keyAction;
}

function handleKeydown(keyevent)
{
	var key = keyevent.key;
	
	var keyAction = keyTranslate(keyevent);
	if(!keyAction) return;
	keysPressed[keyAction] = true;
	if(keysPressed[keyAction]) handleKeyAction(keyAction);
}

function handleKeyup(keyevent)
{
	var key = keyevent.key;
	
	var keyAction = keyTranslate(keyevent);
	if(!keyAction) return;
	keysPressed[keyAction] = false;
}

function handleKeyAction(keyAction)
{
	if(keyAction === "sound_toggle")
	{
		audio.toggleSound();
	}
	if(inGame)
	{
		currentDungeon.handleAction(keyAction);
		if(currentDungeon.gameOver)
		{
			inGame = false;
		}
	}
	else 
	{
		if(keyAction === "space")
		{
			resetGame();
		}
	}
	backgroundRenderer.draw();
}

function draw(time)
{
	if(!lastTime)
	{
		lastTime = time;
	}
	var lapse = time - lastTime;
	lastTime = time;
	
	mainRenderer.draw(lapse);
	window.requestAnimationFrame(draw);
}

function log(message)
{
	console.log(message);
}

function playAudio(trackKey)
{
	audio.playSound(trackKey);
}

export {initialize, log, draw, playAudio};