import Vector from "./utilities/vector.js";

class MapObject
{
	constructor(type)
	{
		this.position = null;
		this.type = type;
	}
	
	move(change)
	{
		if(!this.position) this.position = new Vector(0,0);
		this.position.add(change);
	}
	
	getType()
	{
		return this.type;
	}
	
	getPosition()
	{
		return this.position;
	}
	
	setPosition(position)
	{
		this.position = position;
	}
}

export default MapObject