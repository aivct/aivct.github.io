/**
	Basic geometry, so I don't have to rewrite a thousand times.
	@date 2019-12-29
	@author Frank Lai
 */
function Point(x,y)
{
	this.x = x;
	this.y = y;
}

Point.prototype.equals = function(point)
{
	if(this.x === point.x && this.y === point.y)
	{
		return true;
	}
}

function Rectangle(x,y,width,height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

Rectangle.prototype.isInBounds = function(x,y)
{
	if(x >= this.x && y >= this.y && x < this.x + this.width && y < this.y + this.height) return true;
	return false;
}

function Line(slope,y_intercept)
{
	this.slope = slope;
	this.y_intercept = y_intercept;
}

Line.prototype.set_y_intercept = function(point)
{
	this.y_intercept = (-this.slope * point.x) + point.y;
}

Line.prototype.get_intersection = function(line)
{
	var x = (line.y_intercept - this.y_intercept) / (this.slope - line.slope);
	var y = this.slope * x + this.y_intercept;
	return new Point(x,y);
}

Line.prototype.add_y_intercept = function(amount)
{
	this.y_intercept += amount;
}