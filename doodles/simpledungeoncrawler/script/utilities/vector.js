// a vector, which is really just a collection of two scalars, thus we should really call it a lazy array
class Vector
{
	constructor(x,y)
	{
		this.x = x;
		this.y = y;
	}
	
	add(vector)
	{
		if(!vector) return;
		this.x += vector.x;
		this.y += vector.y;
	}
	
	minus(vector)
	{
		if(!vector) return;
		this.x -= vector.x;
		this.y -= vector.y;
	}
	
	multiply(vector)
	{
		if(!vector) return;
		this.x *= vector.x;
		this.y *= vector.y;
	}
	
	divide(vector)
	{
		if(!vector) return;
		this.x /= vector.x;
		this.y /= vector.y;
	}
	
	equal(vector)
	{
		if(!vector) return;
		if(this.x === vector.x 
			&& this.y === vector.y)
		{
			return true;
		}
		return false;
	}
	
	set(vector)
	{
		if(!vector) return;
		this.x = vector.x;
		this.y = vector.y;
	}
	
	clone()
	{
		return new Vector(this.x, this.y);
	}
	
	toString()
	{
		return `{x:${this.x},y:${this.y}}`;
	}
}

export default Vector;