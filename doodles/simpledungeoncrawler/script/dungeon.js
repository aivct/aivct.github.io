import * as ArrayUtilities from "./utilities/array_utilities.js";
import Vector from "./utilities/vector.js";
import MapObject from "./map_object.js";
import Creature from "./creature.js";
import Player from "./player.js";
import TileMap from "./tile_map.js";
import DungeonGenerator from "./dungeon_generator.js";

import * as Engine from "./engine.js";
import * as Preloader from "./initialize.js";

class Dungeon
{
	// consts 
	static tileSize = 16;
	
	constructor()
	{
		this.currentLevel = new TileMap(8, 7, ["wall","wall","wall","wall","wall","wall","wall","wall","floor","floor","floor","floor","floor","wall","wall","floor","floor","floor","floor","floor","wall","wall","wall","wall","wall","floor","wall","wall","wall","floor","floor","floor","floor","floor","wall","wall","floor","floor","wall","floor","floor","wall","wall","floor","floor","wall","floor","floor","wall","wall","wall","wall","wall","wall","wall","wall"]);
		this.player = new Player();
		this.floorCount = 0;
		this.visibleTiles = [];
		
		this.sprites = [];
		this.playerSprite = this.addSprite(this.player);
		
		this.playerVisionRange = 6;
		this.gameOver = false;
		
		this.potionImage = new AnimationImage(Preloader.getImage("potion_animation"), 6, 60);
		this.monsterImage = new AnimationImage(Preloader.getImage("monster_cube_animation"), 2, 120);
		this.copperManImage = new AnimationImage(Preloader.getImage("copper_man_animation"), 4, 60);
		// shh... I'm an image too!
		this.stairImage = new AnimationImage(Preloader.getImage("stair_image"), 1, 60);
		
		this.floorImage = Preloader.getImage("floor_image");
		this.wallImage = Preloader.getImage("wall_image");
	}
	
	newLevel(width = 50, height = 30)
	{
		this.floorCount++;
		console.log(`Floor: ${this.floorCount}`);
		this.currentLevel = DungeonGenerator.generateMap(width, height, this.player);
		// purge the old sprites 
		this.sprites = [];
		// add the new ones 
		this.playerSprite = this.addSprite(this.player);
		this.stairSprite = this.addSprite(this.currentLevel.stair);
		// this ought to be the job of dungeon generator too.
		this.spawnMonsters(this.floorCount);
		this.spawnPotions();
		
		this.calculateVisibleTiles();
	}
	
	spawnMonsters(level)
	{
		this.currentLevel.iterateTile(
			function(x,y,tile)
			{
				// walkable and unoccupied
				if(tile.isMoveOkay())
				{
					if(Math.random() < 0.1)
					{
						var monster = new Creature(level);
						this.addObject(x,y,monster);
					}
				}
			},this);
	}
	
	spawnPotions()
	{
		this.currentLevel.iterateTile(
			function(x,y,tile)
			{
				// walkable and unoccupied
				if(tile.isMoveOkay())
				{
					if(Math.random() < 0.01)
					{
						this.addObject(x,y,new MapObject("potion"));
					}
				}
			},this);
	}
	
	addSprite(object)
	{
		var image = null;
		if(object instanceof Player)
		{
			image = this.copperManImage;
		}
		else if(object instanceof Creature)
		{
			image = this.monsterImage;
		}
		else if(object.getType() === "potion")
		{
			image = this.potionImage;
		}
		else if(object.getType() === "stair")
		{
			image = this.stairImage;
		}
		var sprite = new Sprite(object, image);
		this.sprites.push(sprite);
		return sprite;
	}
	
	removeSprite(object)
	{
		for(var index = 0; index < this.sprites.length; index++)
		{
			var sprite = this.sprites[index];
			if(sprite.object === object)
			{
				ArrayUtilities.removeElement(this.sprites, sprite);
			}
		}
	}
	
	flushSprites()
	{
		this.sprites = [];
	}
	
	addObject(x,y,object)
	{
		this.currentLevel.addObject(new Vector(x,y), object);
		this.addSprite(object);
	}
	
	removeObject(object)
	{
		this.currentLevel.removeObject(object);
		this.removeSprite(object);
	}
	
	moveMonsters()
	{
		var changeDirectionChance = 0.2;
		
		this.currentLevel.iterateObjects(
			function(object)
			{
				if(object.getType() !== "creature") return; 
				if(object === this.player) return;
				
				
				if(Math.random() < changeDirectionChance)
				{
					object.changeDirection();
				}
				var direction = object.getDirection();
				
				var nextVector = object.getPosition().clone();
				nextVector.add(direction);
				var tileObject = this.currentLevel.getObjectAtPosition(nextVector);
				if(!tileObject)
				{
					this.currentLevel.moveObject(direction, object);
				}
				else 
				{
					if(tileObject instanceof Player)
					{
						object.attackCreature(tileObject);
						tileObject.attackCreature(object);
						
						// make it move
						var animationChange = direction.clone();
						animationChange.multiply(new Vector(Dungeon.tileSize, Dungeon.tileSize));
						var sprite = this.getSprite(object);
						if(!sprite) 
						{
							console.warn(`Object has no sprite.`);
						}
						else 
						{
							sprite.movePosition(animationChange);
						}
						
						// now make it sound 
						var random = Math.random();
						var key;
						if(random < 0.33)
						{
							key = "hit1";
						}
						else if(random <0.66)
						{
							key = "hit2";
						}
						else
						{
							key = "hit3";
						}
						Engine.playAudio(key);
					}
				}
			},this);
	}
	
	getSprite(object)
	{
		for(var index = 0; index < this.sprites.length; index++)
		{
			if(this.sprites[index].object === object) return this.sprites[index];
		}
	}
	
	handleAction(action)
	{
		if(!this.player) return;
		if(!this.currentLevel) return;
		
		var moveVector;
		switch(action)
		{
			case "left":
				moveVector = new Vector(-1,0);
				break;
			case "right":
				moveVector = new Vector(1,0);
				break;
			case "down":
				moveVector = new Vector(0,1);
				break;
			case "up":
				moveVector = new Vector(0,-1);
				break;
			default:
				return;
		}
		var nextVector = this.player.getPosition().clone();
		nextVector.add(moveVector);
		var object = this.currentLevel.getObjectAtPosition(nextVector);
		if(!object)
		{
			this.movePlayer(moveVector);
			if(Math.random() < 0.5)
			{
				Engine.playAudio("bop1");
			}
			else 
			{
				Engine.playAudio("bop2");
			}
		}
		else 
		{
			this.player.onEncounter(object);
			// then add an animation flash
			var animationChange = moveVector.clone();
			animationChange.multiply(new Vector(Dungeon.tileSize, Dungeon.tileSize));
			this.playerSprite.movePosition(animationChange);
			// now sound
			if(object instanceof Creature)
			{
				var random = Math.random();
				var key;
				if(random < 0.33)
				{
					key = "hit1";
				}
				else if(random <0.66)
				{
					key = "hit2";
				}
				else
				{
					key = "hit3";
				}
				Engine.playAudio(key);
			}
			else if(object.getType() === "potion")
			{
				Engine.playAudio("drinking");
			}
			else if(object.getType() === "stair")
			{
				Engine.playAudio("footsteps");
			}
			
			if(object.isDead)
			{
				this.removeObject(object);
			}
			if(object.removeFlag)
			{
				this.removeObject(object);
			}
			if(this.player.nextLevelFlag)
			{
				this.newLevel();
				this.player.nextLevelFlag = false;
			}
		}
		
		this.calculateVisibleTiles();
		
		if(this.player.isDead)
		{
			this.gameOver = true;
		}
		this.moveMonsters();
	}
	
	calculateVisibleTiles()
	{
		this.visibleTiles = this.currentLevel.getVisibleTiles(this.player.getPosition(), this.playerVisionRange);
		
		for(var index = 0; index < this.visibleTiles.length; index++)
		{
			var tile = this.visibleTiles[index];
			tile.reveal();
		}
	}
	
	drawDungeon(context, lapse)
	{
		// first black rect 
		context.fillStyle = "black";
		context.fillRect(0,0,800,600);
		// I feel sick for doing this, but consistency is king
		this.currentContext = context;
		if(!this.currentLevel) return;
		
		this.currentLevel.iterateTile(this.drawTile,this);
	}
	
	drawSprites(context, lapse)
	{
		for(var index = 0; index < this.sprites.length; index++)
		{
			var sprite = this.sprites[index];
			sprite.tweenPosition(lapse);
			if(this.visibleTiles.indexOf(this.currentLevel.getTile(sprite.object.getPosition())) > -1)
			{
				sprite.draw(context);
			}
		}
	}
	
	drawTile(x,y,tile)
	{	
		var context = this.currentContext;
		var tileSize = Dungeon.tileSize;
		var tileType = tile.getType();
		var tileObject = tile.getObject();
		var visible = this.visibleTiles.indexOf(tile) > -1;
		
		var colour = "black";
		var image;
		if(tile.isRevealed())
		{
			if(tileType === "wall")
			{
				colour = "grey";
				image = this.wallImage;
			}
			else if(tileType === "floor")
			{
				colour = "yellow";
				image = this.floorImage;
			}
		}
		
		// draw tile 
		context.fillStyle = colour;
		context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

		// draw image, keeping colour as backup
		if(image)
		{
			context.drawImage(image, x * tileSize, y * tileSize, tileSize, tileSize);
		}
		
		// if not visible (not invisble, but merely out of visibility range) then apply a shadow shader to the whole tile
		if(!visible)
		{
			context.fillStyle = "black";
			context.globalAlpha = 0.5;
			context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
			context.globalAlpha = 1.0;
		}
	}
	
	movePlayer(moveVector)
	{
		this.currentLevel.moveObject(moveVector, this.player);
	}
}
// the things I do for animation
class Sprite
{
	static idealFrameRateLapse = 1000/60;
	
	constructor(object, animationLoop)
	{
		this.object = object;
		this.animation = animationLoop;
		this.age = 0;

		this.actualPosition = new Vector(0,0);
		this.calculateActualPosition();
		
		this.x = new TweenValue(this.actualPosition.x);
		this.y = new TweenValue(this.actualPosition.y);
		this.size = new TweenValue(this.calculateSize());
	}
	
	calculateActualPosition()
	{
		var position = this.object.getPosition();
		if(!position)
		{
			return;
		}
		this.actualPosition.x = position.x * Dungeon.tileSize;
		this.actualPosition.y = position.y * Dungeon.tileSize;
	}
	
	calculateSize()
	{
		if(this.object instanceof Creature)
		{
			var sideLength = Math.ceil(Dungeon.tileSize * Math.sqrt(this.object.getHitpointsPercentage()));
			return sideLength;
		}
		else return Dungeon.tileSize;
	}
	
	tweenPosition(lapse)
	{
		this.age += lapse;
		// first get the target values 
		this.calculateActualPosition();
		this.x.setTarget(this.actualPosition.x);
		this.y.setTarget(this.actualPosition.y);
		this.size.setTarget(this.calculateSize());
		
		this.x.tween(lapse);
		this.y.tween(lapse);
		this.size.tween(lapse);
	}
	
	movePosition(change)
	{
		this.x.setValue(this.x.getValue() + change.x);
		this.y.setValue(this.y.getValue() + change.y);
	}
	
	draw(context)
	{
		if(this.object instanceof Creature) context.fillStyle = "red";
		if(this.object instanceof Player) context.fillStyle = "green";
		// if(this.object.getType() === "potion") context.fillStyle = "#01fe23";
		
		var sideLength = this.size.getValue();
		var sideOffset = (Dungeon.tileSize - sideLength)/2;
		var x = this.x.getValue() + sideOffset;
		var y = this.y.getValue() + sideOffset;
		
		if(this.animation)
		{
			var image = this.animation.getImage();
			var frameIndex = this.animation.getFrameIndex(this.age);
			// programmer's hedge
			if(!image) return;
			
			context.drawImage(image
				,Dungeon.tileSize * frameIndex
				,0
				,Dungeon.tileSize
				,Dungeon.tileSize
				,Math.round(x)
				,Math.round(y)
				,Math.ceil(sideLength)
				,Math.ceil(sideLength));
		}
		else 
		{
			// ceil() instead of round() for size so that at low values it is at least a little visible.
			context.fillRect(Math.round(x)
				,Math.round(y)
				,Math.ceil(sideLength)
				,Math.ceil(sideLength));
		}
	}
}

// only accepts primitives like numbers, not objects 
class TweenValue
{
	static tweenPercent = 0.4;
	static cutoffDistance = 2;
	static idealFrameRateLapse = 1000/60;
	
	constructor(initialValue)
	{
		this.targetValue = initialValue;
		this.value = this.targetValue;
	}
	
	getValue()
	{
		return this.value;
	}
	
	setValue(value)
	{
		this.value = value;
	}
	
	setTarget(newValue)
	{
		this.targetValue = newValue;
	}
	
	tween(lapse)
	{
		var difference = this.targetValue - this.value;
		if(Math.abs(difference) < TweenValue.cutoffDistance)
		{
			this.value = this.targetValue;
			return;
		}
		var change = difference * Math.min(TweenValue.tweenPercent * (lapse / Sprite.idealFrameRateLapse), 1);
		this.value += change;
	}
}

// takes in an animation image and outputs the frame index to use
class AnimationImage
{
	static defaultFrameLength = 100;
	
	constructor(image, frameCount, frameLength = AnimationImage.defaultFrameLength)
	{
		this.image = image;
		this.frameCount = frameCount;
		this.frameLength = frameLength;
		
		this.loopLength = this.frameCount * this.frameLength;
	}
	
	getImage()
	{
		return this.image;
	}
	
	getFrameIndex(timeStamp)
	{
		var frameIndex = Math.floor((timeStamp % this.loopLength)/this.frameLength);
		if(frameIndex === this.frameCount) this.frameIndex = this.frameCount - 1;
		return frameIndex;
	}
}

export default Dungeon;