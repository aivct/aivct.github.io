class Renderer
{
	constructor(canvas, components = [])
	{
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		
		this.components = components;
		
		// default settings
		this.context.imageSmoothingEnabled = false;
	}
	
	draw(lapse) 
	{
		this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
		
		for(var index = 0; index < this.components.length; index++)
		{
			this.components[index].draw(this.context, lapse);
		}
	}
	
	// repaints to another context using this canvas as a buffer.
	repaint(context,x=0,y=0)
	{
		context.drawImage(this.canvas,x,y);
	}
}

export default Renderer;