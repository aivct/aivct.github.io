function Map(width,height)
{
	this.width = width;
	this.height = height;
	
	// create the tile map and set neighbours
	this.tiles = [];
	for(var index = 0, length = width * height; index < length; index++)
	{
		this.tiles.push(new Tile(index % width, Math.floor(index / width)));
	}
	
	this.objects = [];
	
	this.highestMonsterCount = 0;
	this.highestHeroCount = 0;
}

Map.prototype.tick = function()
{
	this.highestMonsterCount = 0;
	this.highestHeroCount = 0;
	
	this.objects.forEach(object => 
	{
		object.tick();
		if(object.movable)
		{
			// now wander around 
			var dice = Math.random();
			var x = object.x;
			var y = object.y;
			if(dice < 0.25)
			{
				y = y - 1;
			}
			else if(dice < 0.5)
			{
				y = y + 1;
			}
			else if(dice < 0.75)
			{
				x = x + 1;
			}
			else if(dice < 1.00)
			{
				x = x - 1;
			}
			
			if(this.isInBounds(x,y)) this.moveObject(object,x,y);
		}
	});
	
	// now check each tile 
	for(var index = 0, length = this.width * this.height; index < length; index++)
	{
		var tile = this.tiles[index];
		
		// set highest monster and hero counts 
		if(tile.heroes.length > this.highestHeroCount) this.highestHeroCount = tile.heroes.length;
		if(tile.monsters.length > this.highestMonsterCount) this.highestMonsterCount = tile.monsters.length;
		
		// heroes will randomly battle a random monster.
		if(tile.heroes.length > 0 && tile.monsters.length > 0)
		{
			var hero = tile.getRandomHero();
			var monster = tile.getRandomMonster();
			World.battle(hero, monster);
		}
		
		if(tile.town)
		{
			// now check heroes and make them do stuff!
			if(tile.heroes.length > 0)
			{
				var hero = tile.getRandomHero();
				hero.sell_loot(tile.town);
				hero.buy_equipment(tile.town);
				// check health, and a bit of random 
				if(Math.random() < 0.01 && hero.score > hero.predict_hero_score())
				{
					tile.town.retire_hero(hero); // more people will settle down!
				}
			}
			// now try to have guards kill the heroes 
			// they may die too.
			if(tile.monsters.length > 0)
			{
				var hero = tile.town.get_random_resident();
				var monster = tile.getRandomMonster();
				World.battle(hero, monster);
			}
		}
		else 
		{
			// now we try to settle down a bit 
			if(tile.monsters.length === 0 && tile.heroes.length > 1)
			{
				if(Math.random() < (1 / World.towns.length))
				{
					var gold = 0;
					tile.heroes.forEach(hero => gold+=hero.gold);
					if(gold >= 100 * World.towns.length)
					{
						this.plopObject(new Town(tile.heroes),tile.x,tile.y);
					}
					
				} // end if random 
			} // end if 
		} // end else 
	} // end for
}

Map.prototype.plopObject = function(object, x, y)
{
	// validate first to save time and prevent errors
	if(!this.isObjectInBounds(object,x,y))
	{
		Engine.log(`GridMap: plop out of bounds at (${x},${y}).`);
		Engine.notify(`Object out of bounds!`);
		return false;
	}
	
	// check one last time to make sure object isn't already plopped 
	if(!object.plop(x, y)) return false;
	
	var occupiedTile = this.getTile(x,y);
	// since it is all clear, then proceed and set everything
	occupiedTile.addObject(object);
	this.addObject(object);
	
	// set highest monster and hero counts 
	if(occupiedTile.heroes.length > this.highestHeroCount) this.highestHeroCount = occupiedTile.heroes.length;
	if(occupiedTile.monsters.length > this.highestMonsterCount) this.highestMonsterCount = occupiedTile.monsters.length;
	return true;
}

Map.prototype.isObjectInBounds = function(object, x, y)
{
	// works either way, checking all the falses or all the truths
	if(x < 0 || x + object.width > this.width || y < 0 || y + object.height > this.height)
	{
		return false;
	}
	return true;
}

Map.prototype.unplopObject = function(object)
{	
	var occupiedTile = this.getTile(object.x,object.y);
	
	if(!object.unplop()){return false;}
	// since it is all clear, then proceed and set everything
	occupiedTile.removeObject(object);
	this.removeObject(object);
	return true;
}

Map.prototype.moveObject = function(object, x, y)
{
	// validate first to save time and prevent errors
	if(!this.isObjectInBounds(object,x,y))
	{
		Engine.log(`GridMap: move out of bounds to (${x},${y}).`);
		Engine.notify(`Invalid destination.`);
		return false;
	}
	
	if(!object.isPlopped) return false;
	
	var occupiedTile = this.getTile(object.x, object.y);
	occupiedTile.removeObject(object);
	
	var newTile = this.getTile(x,y);
	newTile.addObject(object);
	
	// now we need to update object information too 
	object.move(x,y);
	return true;
}

Map.prototype.addObject = function(object)
{
	this.objects.push(object);
}

Map.prototype.removeObject = function(object)
{
	this.objects = this.objects.filter(element => !(element === object));
}

Map.prototype.getTile = function(x,y)
{
	if(this.isInBounds(x,y)) return this.tiles[y * this.width + x];
	return null;
}

Map.prototype.getObjects = function()
{
	return this.objects;
}
/**
	If a set of coordinates is within the map, return true.
 */
Map.prototype.isInBounds = function(x,y)
{
	if(x >= 0 && x < this.width && y >= 0 && y < this.height)
	{
		return true;
	}
	return false;
}

/**
	**Utility**
	Translates a list of coordinates by an amount x,y
 */
Map.prototype.translateCoordinates = function(coordinateList, x, y)
{
	var newCoordinateList = [];
	for(var index = 0; index < coordinateList.length; index++)
	{
		var coordinate = coordinateList[index];
		newCoordinateList.push({x:coordinate.x + x, y:coordinate.y + y});
	}
	return newCoordinateList;
}

Map.prototype.print = function(view = "index")
{
	var line = "";
	for(var index = 0; index < this.width * this.height; index++)
	{
		var key;
		switch(view)
		{
			case "heroes": 
				var agents = this.tiles[index].objects;
				var heroes = 0;
				agents.forEach(agent => {if(Hero.prototype.isPrototypeOf(agent)) heroes++});
				key = heroes;
				break;
			case "agents": 
				key = this.tiles[index].objects.length;
				break;
			case "towns":
				key = this.tiles[index].town ? "T": " ";
				break;
			default:
				key = index;
				break;
		}
		
		line += "|" + pad_number(key,3," ");
		if(index % this.width === this.width -1 )
		{
			line += "|";
			console.log(line);
			line = "";
		}
	}
}

/**
	A standard representation of a tile. 
	Stores 
		- x 
		- y
		- Currently occupied object, if any 
		- Any neighbours
 */
function Tile(x,y)
{
	this.x = x;
	this.y = y;
	this.objects = [];
	this.heroes = [];
	this.monsters = [];
	this.town = null;
	// this.neighbours = {north: null, south: null, east: null, west: null};
}
/*
Tile.prototype.setNeighbours = function(north,south,east,west)
{
	this.neighbours = {north:north, south: south, east: east, west: west};
}

Tile.prototype.getNeighbours = function()
{
	return this.neighbours;
}
*/
Tile.prototype.addObject = function(object)
{
	this.objects.push(object);
	if(Hero.prototype.isPrototypeOf(object)) this.heroes.push(object);
	if(Monster.prototype.isPrototypeOf(object)) this.monsters.push(object);
	if(Town.prototype.isPrototypeOf(object))
	{
		if(!this.town)
		{
			this.town = object;
		}
		else 
		{
			Engine.log(`A town already exists at tile ${this.x},${this.y}!`);
		}
	}
}

Tile.prototype.removeObject = function(object)
{
	this.objects = this.objects.filter(element => !(element === object));
	if(object.type === "hero") this.heroes = this.heroes.filter(element => !(element === object));
	if(object.type === "monster") this.monsters = this.monsters.filter(element => !(element === object));
	if(object.type === "town") this.town = null;
}

Tile.prototype.getRandomHero = function()
{
	return this.heroes[random_integer(0, this.heroes.length)];
}

Tile.prototype.getRandomMonster = function()
{
	return this.monsters[random_integer(0, this.monsters.length)];
}

/**
	A map object. 
	Stores 
		- Occupied tiles 
	Knows
		- width 
		- height
	Performs 
		- Draw 
		- Tick
		- Plop and unplop
		- Check neighbouring objects
 */
function MapObject(width, height)
{
	this.width = width;
	this.height = height;
	
	this.x = null;
	this.y = null;
	this.isPlopped = false;
	this.active = true;
}

MapObject.prototype.draw = function(context,x,y)
{
	
}

MapObject.prototype.tick = function()
{
	
}

MapObject.prototype.plop = function(x, y)
{
	if(this.isPlopped)
	{
		Engine.log(`Object is already plopped!`);
		return false;
	}
	this.isPlopped = true;
	this.x = x;
	this.y = y;
	return true;
}

MapObject.prototype.unplop = function()
{
	if(!this.isPlopped)
	{
		Engine.log(`Object isn't plopped yet!`);
		console.log(this);
		return false;
	}
	this.isPlopped = false;
	this.x = null;
	this.y = null;
	return true;
}

MapObject.prototype.move = function(x, y)
{
	this.x = x;
	this.y = y;
}