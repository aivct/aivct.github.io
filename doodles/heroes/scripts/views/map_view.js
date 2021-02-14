/*
	
 */
class MapView extends UIPanel
{
	constructor(map)
	{
		super(null,null,400,400,"map_view");
		this.map = map;
	}
	
	paint(context,offset_x,offset_y)
	{
		context.translate(offset_x,offset_y);
		// 20x20 pixels shall paint the world
		var tileWidth = 20;
		var tileHeight = 20;
		
		var maxHeroes = this.map.highestHeroCount;
		var maxMonsters = this.map.highestMonsterCount;
		
		// purely for canvas /0 bug avoidance
		if(maxHeroes < 1) maxHeroes = 1;
		if(maxMonsters < 1) maxMonsters = 1;
		
		for(var x = 0; x < this.map.width; x++)
		{
			for(var y = 0; y < this.map.height; y++)
			{
				var tile = this.map.getTile(x,y);
				// this's the neat trick:we'll fill it differently depending on the monster count.
				context.fillStyle = `rgb(${Math.floor(255*tile.monsters.length/maxMonsters)}, ${Math.floor(255*tile.heroes.length/maxHeroes)}, ${tile.town ? 255 : 100})`;
				context.fillRect(x*tileWidth,y*tileHeight,tileWidth,tileHeight);
				//context.fill();
			}
		}
		//context.stroke();
		
		context.translate(-offset_x,-offset_y);
	}
}