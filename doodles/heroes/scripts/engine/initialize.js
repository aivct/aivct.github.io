var images = {
	//"map1": create_image("assets/map1.png"),
	
}

window.onload = function()
{
	World.generate_map();
	
	Engine.initialize();
	
	World.new_generation();
	//World.map.print("heroes");
	
	setInterval(World.tick.bind(World),10)

}