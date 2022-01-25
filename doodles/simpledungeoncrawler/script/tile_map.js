import * as ArrayUtilities from "./utilities/array_utilities.js";
import Vector from "./utilities/vector.js";
import MapObject from "./map_object.js";

/**
	Map is structured up down, left right.
 */
class TileMap
{
	constructor(width, height, data = [])
	{
		this.width = width;
		this.height = height;
		
		this.map = [];
		for(var index = 0; index < width * height; index++)
		{
			var x = Math.floor(index / height);
			var y = index % height;
			var tile = "void";
			if(data[index]) tile = data[index];
			this.map.push(new Tile(new Vector(x,y),tile));
		}
		
		this.objects = [];
	}
	
	addObject(position,object)
	{
		if(this.objects.indexOf(object) > -1) return false;
		if(!this.tileExists(position)) return false;
		this.objects.push(object);
		var tile = this.getTile(position);
		tile.setObject(object);
		object.setPosition(position);
	}
	
	removeObject(object)
	{
		var position = object.getPosition();
		if(!this.tileExists(position))
		{
			console.warn(`Object holds invalid position at ${JSON.stringify(position)}. Unable to remove object.`);
			return false;
		}
		
		var tile = this.getTile(position);
		tile.removeObject(object);
		ArrayUtilities.removeElement(this.objects, object);
	}
	
	setObjectPosition(newPosition,object)
	{
		if(!this.tileExists(newPosition)) return false;
		
		var newTile = this.getTile(newPosition);
		if(!newTile.isMoveOkay()) return false;
		
		var originalPosition = object.getPosition();
		var originalTile = this.getTile(originalPosition);
		originalTile.removeObject();
		newTile.setObject(object);
		object.setPosition(newPosition);
		
		return true;
	}
	
	moveObject(change, object)
	{
		var newPosition = object.getPosition().clone();
		newPosition.add(change);
		// position validation is already handled
		return this.setObjectPosition(newPosition, object);
	}
	
	getObjectAtPosition(position)
	{
		if(!this.tileExists(position)) return false;
		var tile = this.getTile(position);
		return tile.getObject();
	}
	
	getTile(position)
	{
		var x = position.x;
		var y = position.y;
		return this.map[this.getIndex(x,y)];
	}
	
	getDistanceTaxicab(origin, destination)
	{
		return Math.sqrt(Math.pow(origin.x - destination.x, 2) + Math.pow(origin.y - destination.y, 2));
	}
	
	getDistanceTile(origin, destination)
	{
		return Math.abs(origin.x - destination.x) + Math.abs(origin.y - destination.y);
	}
	
	getFourNeighbours(position)
	{
		var positions = [];
		positions.push(new Vector(position.x + 1, position.y));
		positions.push(new Vector(position.x, position.y + 1));
		positions.push(new Vector(position.x - 1, position.y));
		positions.push(new Vector(position.x, position.y - 1));
		var neighbours = this.getValidTiles(positions);
		return neighbours;
	}
	
	getEightNeighbours(position)
	{
		var positions = [];
		positions.push(new Vector(position.x + 1, position.y));
		positions.push(new Vector(position.x, position.y + 1));
		positions.push(new Vector(position.x - 1, position.y));
		positions.push(new Vector(position.x, position.y - 1));
		positions.push(new Vector(position.x - 1, position.y - 1));
		positions.push(new Vector(position.x + 1, position.y + 1));
		positions.push(new Vector(position.x + 1, position.y - 1));
		positions.push(new Vector(position.x - 1, position.y + 1));
		var neighbours = this.getValidTiles(positions);
		return neighbours;
	}
	
	getValidTiles(positions)
	{
		var validTiles = [];
		for(var index = 0; index < positions.length; index++)
		{
			var tile = this.getTile(positions[index]);
			if(tile)
			{
				validTiles.push(tile);
			}
		}
		return validTiles;
	}
	
	// valid for distances of less than 50
	getTileFloodDistanceLimited(position, distance, type)
	{
		var tilesFloodable = [];
		var tilesToCheck = [];
		
		var currentPosition = position.clone();
		var tile = this.getTile(currentPosition);
		if(!tile) return null;
		tilesToCheck.push(tile);
		
		while(tilesToCheck.length > 0)
		{
			// check tile
			var tile = tilesToCheck.shift();
			if(tile.getType() === type)
			{
				tilesFloodable.push(tile);
				var neighbours = this.getFourNeighbours(tile.getPosition());
				for(var neighbour = 0; neighbour < neighbours.length; neighbour++)
				{
					// check if this a tile we haven't checked before
					if((!(tilesFloodable.indexOf(neighbours[neighbour]) > -1)) && (!(tilesToCheck.indexOf(neighbours[neighbour]) > -1)))
					{
						if(this.getDistanceTaxicab(position, neighbours[neighbour].getPosition()) < distance)
						{
							tilesToCheck.push(neighbours[neighbour]);
						}
					}
				}
			}
		}
		
		return tilesFloodable;
	}
	
	getIndex(x,y)
	{
		return x * this.height + y;
	}
	
	tileExists(position)
	{
		var x = position.x;
		var y = position.y;
		if(this.map[this.getIndex(x,y)]) return true;
		return false;
	}
	
	setTileType(position,type)
	{
		if(!this.tileExists(position)) return false;
		var tile = this.getTile(position);
		tile.setType(type);
		return true;
	}
	
	fillTileType(xPosition,yPosition,width,height,type)
	{
		for(var x = xPosition; x < xPosition + width; x++)
		{
			for(var y = yPosition; y < yPosition + height; y++)
			{
				this.setTileType(new Vector(x,y),type);
			}
		}
	}
	
	getTileCount(type)
	{
		var tileCount = 0;
		for(var x = 0; x < this.width; x++)
		{
			for(var y = 0; y < this.height; y++)
			{
				var tile = this.getTile(new Vector(x,y));
				if(tile.getType() === type)
				{
					tileCount++;
				}
			}
		}
		return tileCount;
	}
	
	iterate(action, objectContext = this)
	{
		for(var x = 0; x < this.width; x++)
		{
			for(var y = 0; y < this.height; y++)
			{
				action.call(objectContext,x,y);
			}
		}
	}
	
	iterateTile(action, objectContext = this)
	{
		for(var x = 0; x < this.width; x++)
		{
			for(var y = 0; y < this.height; y++)
			{			
				var tile = this.getTile(new Vector(x,y));
				action.call(objectContext,x,y,tile);
			}
		}
	}
	
	iterateObjects(action, objectContext = this)
	{
		for(var index = 0; index < this.objects.length; index++)
		{
			var object = this.objects[index];
			action.call(objectContext,object);
		}
	}
	
	applyVisibleNeighbour(visibleTiles, neighbourTileType)
	{
		var newVisibleTiles = [];
		for(var index = 0; index < visibleTiles.length; index++)
		{
			var tile = visibleTiles[index];
			var neighbours = this.getEightNeighbours(tile.getPosition());
			for(var neighbourIndex = 0; neighbourIndex < neighbours.length; neighbourIndex++)
			{
				var neighbour = neighbours[neighbourIndex];
				if(neighbour.getType() === neighbourTileType)
				{
					if(!(newVisibleTiles.indexOf(neighbour) > -1) && !(visibleTiles.indexOf(neighbour) > -1))
					{
						newVisibleTiles.push(neighbour);
					}
				}
			}
		}
		
		for(var index = 0; index < newVisibleTiles.length; index++)
		{
			visibleTiles.push(newVisibleTiles[index]);
		}
	}
	
	// the new combined function should be more performant as well as less convoluted, at the expense of being much more rigid.
	// considering we're angling for the release build right now, that shouldn't be a problem
	getVisibleTiles(sourcePosition, maxDistance)
	{
		var visibleTiles = [];
		var tilesToCheck = [];
		
		var currentPosition = sourcePosition.clone();
		var tile = this.getTile(currentPosition);
		if(!tile) return null;
		tilesToCheck.push(tile);
		
		while(tilesToCheck.length > 0)
		{
			// check tile
			var tile = tilesToCheck.shift();
			if(tile.getType() === "floor")
			{
				visibleTiles.push(tile);
				var neighbours = this.getEightNeighbours(tile.getPosition());
				for(var neighbour = 0; neighbour < neighbours.length; neighbour++)
				{
					// check if this a tile we haven't checked before
					if((!(visibleTiles.indexOf(neighbours[neighbour]) > -1)) && (!(tilesToCheck.indexOf(neighbours[neighbour]) > -1)))
					{
						if(this.getDistanceTaxicab(sourcePosition, neighbours[neighbour].getPosition()) < maxDistance)
						{
							tilesToCheck.push(neighbours[neighbour]);
						}
					}
				}
			}
			else if(tile.getType() === "wall")
			{
				// skip a whole shabang, we only look for distance here, we know already since that it origins from a floor 
				if(this.getDistanceTaxicab(sourcePosition, tile.getPosition()) < maxDistance)
				{
					if(!(visibleTiles.indexOf(tile) > -1))
					{
						visibleTiles.push(tile);
					}
				}
			}
		}
		
		return visibleTiles;
	}
	
	// ONLY reveals the eight neighbours of a tile
	revealEightNeighbours(tile)
	{
		if(!tile) return;
		var neighbours = this.getEightNeighbours(tile.getPosition());
		for(var index = 0; index < neighbours.length; index++)
		{
			neighbours[index].reveal();
		}
	}
}

class Tile
{
	constructor(position,type)
	{
		this.position = position;
		this.type = type;
		this.revealed = false;
		
		this.object = null;
	}
	
	getPosition()
	{
		return this.position;
	}
	
	getType()
	{
		return this.type;
	}
	
	setType(type)
	{
		this.type = type;
	}
	
	isRevealed()
	{
		return this.revealed;
	}
	
	reveal()
	{
		this.revealed = true;
	}
	
	unreveal()
	{
		this.revealed = false;
	}
	
	hasObject()
	{
		if(this.object) return true;
		return false;
	}
	
	getObject()
	{
		return this.object;
	}
	
	setObject(object)
	{
		this.object = object;
	}
	
	removeObject()
	{
		this.object = null;
	}
	
	isMoveOkay()
	{
		if(!this.isWalkable()) return false;
		// already occupied by another thing
		if(this.hasObject()) return false; 
		return true;
	}
	
	isWalkable()
	{
		if(this.isVoid()) return false;
		if(this.isWall()) return false;
		return true;
	}
	
	isWall()
	{
		if(this.type === "wall") return true;
		return false;
	}
	
	isVoid()
	{
		if(this.type === "void") return true;
		return false;
	}
}

export default TileMap;