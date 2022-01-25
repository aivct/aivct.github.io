// 
import TileMap from "./tile_map.js";
import Rectangle from "./rectangle.js";
import Vector from "./utilities/vector.js";
import MapObject from "./map_object.js";
import Creature from "./creature.js";
import * as Random from "./utilities/random.js";

class DungeonGenerator
{
	static generateMap(width, height, player)
	{
		var debug_mode = true;
		
		console.log("Generating a new map...");
		var map = new TileMap(width, height);
		console.log("Asking the drunk to walk...");
		DungeonGenerator.drunkenWalk(map);
		console.log("Applying walls to the floor...");
		DungeonGenerator.applyWallsToFloor(map);
		if(debug_mode)
		{
			console.log(`Floor count: ${map.getTileCount("floor")}`);
			console.log(`Wall count: ${map.getTileCount("wall")}`);
			console.log(`Stair location: ${map.stair.getPosition().toString()}`);
		}
		map.addObject(DungeonGenerator.getMapCenterPosition(map), player);
		console.log("All set!");
		return map;
	}
	
	// standard calculation so that it's the same for the same map 
	static getMapCenterPosition(map)
	{
		return new Vector(Math.floor(map.width / 2), Math.floor(map.height / 2));
	}
	
	static drunkenWalk(map)
	{
		var chanceOfChange = 0.2;
		var roomChance = 0.05;
		var stepPercentage = 0.5;
		
		var stepCount = map.width * map.height * stepPercentage;
		
		var currentPosition = DungeonGenerator.getMapCenterPosition(map);
		var currentDirection = new Vector(0,1);
		// set starting position first 
		map.setTileType(currentPosition, "floor");
		// anything ONE tile away from map edge is invalid for a step floor, because we need walls too!
		for(var step = 0; step < stepCount; step++)
		{
			currentPosition.add(currentDirection);
			if(!DungeonGenerator.isValidFloor(map, currentPosition))
			{
				currentPosition.minus(currentDirection);
				currentDirection = DungeonGenerator.drunkenWalkRandomTurn(currentDirection);
			}
			else 
			{
				map.setTileType(currentPosition, "floor");
				if(Math.random() < chanceOfChange)
				{
					currentDirection = DungeonGenerator.drunkenWalkRandomTurn(currentDirection);
					// on direction change, also have chance to generate a floored room roughly centered on the tile.
					if(Math.random() < roomChance)
					{
						var roomWidth = Random.randomInteger(2,5);
						var roomHeight = Random.randomInteger(2,5);
						var roomX = Math.floor(currentPosition.x - roomWidth/2);
						var roomY = Math.floor(currentPosition.y - roomHeight/2);
						
						if(!(roomX > 0))
						{
							roomX = 1;
						}
						if(!(roomX + roomWidth < map.width - 1))
						{
							roomWidth = map.width - 1 - roomX;
						}
						if(!(roomY > 0))
						{
							roomY = 1;
						}
						if(!(roomY + roomHeight < map.height - 1))
						{
							roomHeight = map.height - 1 - roomY;
						}
						
						map.fillTileType(roomX, roomY, roomWidth, roomHeight, "floor");
					}
				}
			}
		}
		
		map.stair = new MapObject("stair");
		// put stairs at ending
		map.addObject(currentPosition,map.stair);
	}
	
	static randomDirection()
	{
		var random = Math.random();
		if(random > 0.75)
		{
			return new Vector(1,0);
		}
		else if(random > 0.5)
		{
			return new Vector(0,1);
		}
		else if(random > 0.25)
		{
			return new Vector(-1,0);
		}
		else 
		{
			return new Vector(0,-1);
		}
		return new Vector(0,0);
	}
	
	static drunkenWalkRandomTurn(currentDirection)
	{
		// since it's a random turn (we don't care about direction)
		// we can exchange x/y and flip the sign
		// then it's a 50% turn in either direction.
		var x = currentDirection.x;
		var y = currentDirection.y;
		
		if(x !== 0)
		{
			y = x;
			x = 0;
		}
		else if(y !== 0)
		{
			x = y;
			y = 0;
		}
		
		if(Math.random() < 0.5)
		{
			// negative zero is still zero (even if it's negative zero)
			x = -x;
			y = -y;
		}
		return new Vector(x,y);
	}
	
	static isValidFloor(map, position)
	{
		if(position.x > 0
			&& position.y > 0
			&& position.x < map.width - 1
			&& position.y < map.height - 1)
		{
			return true;
		}
		return false;
	}
	
	static applyWallsToFloor(map)
	{
		map.iterateTile((x,y,tile) =>
			{
				if(DungeonGenerator.isNeighbourFloor(map, tile.getPosition()))
				{
					if(tile.getType() !== "floor")
					{
						tile.setType("wall");
					}
				}
			}, this);
	}
	
	static isNeighbourFloor(map, position)
	{
		var neighbours = DungeonGenerator.getEightNeighbours(map, position);
		for(var index = 0; index < neighbours.length; index++)
		{
			if(neighbours[index].getType() === "floor")
			{
				return true;
			}
		}
		return false;
	}
	
	static getEightNeighbours(map, position)
	{
		var relativeX = [-1,0,1];
		var relativeY = [-1,0,1];
		var neighbours = [];
		
		for(var xIndex = 0; xIndex < relativeX.length; xIndex++)
		{
			for(var yIndex = 0; yIndex < relativeY.length; yIndex++)
			{
				if(xIndex === 1 && yIndex === 1) continue;
				var x = position.x + relativeX[xIndex];
				var y = position.y + relativeY[yIndex];
				var tile = map.getTile(new Vector(x,y));
				if(!tile) continue;
				neighbours.push(tile);
			}
		}
		return neighbours;
	}
}

export default DungeonGenerator;