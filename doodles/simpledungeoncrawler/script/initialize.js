/**
	Put all inits here.
	
	@author laifrank2002
	@date 2020-02-16
 */
import * as Engine from "./engine.js";

// ensure everything is loaded first.
var windowLoaded = false;
var imagesLoaded = false;
var initialized = false;

window.onload = function()
{
	windowLoaded = true;
}

function initialize()
{
	if(initialized)
	{
		console.warn("Everything has already been initialized!");
	}
	initialized = true;
	
	Engine.initialize();
}

function onLoad()
{
	if(imagesLoaded && audioLoaded)
	{
		initialize();
	}
}

// we put it here to deal with the import trickery without needing to add more complication
var imageSources = {
	"potion_animation":"asset/sprites/potion_animation.png",
	"monster_cube_animation":"asset/sprites/monster_cube_animation.png",
	"copper_man_animation":"asset/sprites/copper_man_animation.png",
	"floor_image":"asset/sprites/floor_image.png",
	"wall_image":"asset/sprites/wall_image.png",
	"stair_image":"asset/sprites/stair_image.png",
	"audio_on":"asset/sprites/audio_on.png",
	"audio_off":"asset/sprites/audio_off.png",
};

var imageLoadedCount = 0;
var imageCount = 0;
var images = {};
var imagesLoaded = false;

function loadImages(sources)
{
	for(var key in sources)
	{
		var imagePromise = new Promise((resolve, reject) =>
		{
			var image = new Image();
			
			image.addEventListener('load', resolve);
			image.addEventListener('error', reject);
			image.src = sources[key];
			images[key] = image;
			imageCount++;
		});
		// if the image isn't loaded, not our problem we still need to load the rest of the page
		imagePromise.then(isImagesLoaded, isImagesLoaded);
	}
}

function isImagesLoaded()
{
	imageLoadedCount++;
	if(imageLoadedCount === imageCount)
	{
		// when we decompose this module, this should be a foreign function (ie, Preloader.onLoad());
		imagesLoaded = true;
		onLoad();
	}
}

function getImage(key)
{
	return images[key];
}

// audio 
var audioSources = {
	"hit1": "asset/sfx/13966__adcbicycle__14.wav",
	"hit2": "asset/sfx/13970__adcbicycle__18.wav",
	"hit3": "asset/sfx/13990__adcbicycle__38.wav",
	"bop1": "asset/sfx/377017__elmasmalo1__notification-pop.wav",
	"bop2": "asset/sfx/377020__elmasmalo1__bubble-pop-high-pitched-short.wav",
	"drinking": "asset/sfx/433645__dersuperanton__drinking-and-swallow.wav",
	"footsteps": "asset/sfx/459964__florianreichelt__footsteps-on-concrete.wav",
}

var audioLoadedCount = 0;
var audioCount = 0;
var audioLibrary = {};
var audioLoaded = false;

function loadAudio(sources)
{
	for(var key in sources)
	{
		var audio = new Audio();
		audio.addEventListener('canplaythrough', isAudioLoaded);
		audio.addEventListener('stalled', isAudioLoaded);
		audio.src = sources[key];
		
		audioLibrary[key] = audio;
		audioCount++;
	}
}

function isAudioLoaded()
{
	audioLoadedCount++;
	if(audioLoadedCount === audioCount)
	{
		audioLoaded = true;
		onLoad();
	}
}

function getAudioLibrary()
{
	return audioLibrary;
}

// preloading
loadImages(imageSources);
loadAudio(audioSources);

export {getImage, getAudioLibrary};