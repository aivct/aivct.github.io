/**
	Holy smokes, they'll let me have a world here?
 */
var World = {
	
	heroes: [],
	monsters: [],
	npcs: [],
	towns: [],
	
	generation: 0,
	year: 0,
	
	heroes_per_generation: 100,
	monsters_per_generation: 1000,
	monster_spawn_rate: 1,
	
	development_level: 0,
	time_per_generation: 1000,
	
	map: null,
	map_width: 20,
	map_height: 20,
	
	graveyard: [],
	grim_reaper: new Agent(100,100,100,100),
	
	message_log: [],
	
	generate_heroes: function()
	{
		// now spawn 'em 		
		for(var i = 0; i < this.heroes_per_generation + this.towns.length; i++)
		{
			var hero;
			// spawn SOMEWHERE! (if there are no towns yet)
			if(this.towns.length <= 0)
			{
				hero = new Hero(0);
				this.map.plopObject(hero, random_integer(0, this.map.width), random_integer(0, this.map.height));
			}
			else 
			{
				var town = this.towns[random_integer(0, this.towns.length)];
				hero = new Hero(town.development);
				this.map.plopObject(hero, town.x, town.y);
			}
			this.heroes.push(hero);
		}
	},
	
	generate_monsters: function(number)
	{
		for(var i = 0; i < number; i++)
		{
			this.map.plopObject(new Monster(random_integer(0,this.development_level + 10)), random_integer(0, this.map.width), random_integer(0, this.map.height));
		}
	},
	
	generate_map: function()
	{
		this.map = new Map(this.map_width, this.map_height);
	},
	
	new_generation: function()
	{
		// I'm sorry, but sometimes old heroes must die. Those who are retired though, still shall live.
		this.flush_heroes();
		
		// and we shall gauge the development of the world by its towns.
		
		
		// then a hundred empty turns 
		for(var i = 0; i < 100; i++)
		{
			this.tick();
		}
		
		// und we shall heal the town heroes 
		for(var i = 0; i < this.towns.length; i++)
		{
			this.towns[i].new_era();
		}
		
		// then we shall have new heroes 
		this.generate_heroes();
		// and monsters too
		this.generate_monsters(this.monsters_per_generation);
		this.generation++;
		this.log(`The silver springs brings with it a new generation. The emptiness is deafening.`);
	},
	
	get_world_development: function()
	{
		if(this.towns.length > 0)
		{
			var sum = 0;
			this.towns.forEach(town => sum += town);
			this.development_level = Math.floor(sum / this.towns.length);
		}
		else 
		{
			this.development_level = 0;
		}
	},
	
	flush_heroes: function()
	{
		this.heroes.forEach(hero => hero.die(this.grim_reaper));
	},
	
	remove_agent: function(agent)
	{
		this.map.unplopObject(agent);
	},
	
	bury_hero: function(hero)
	{
		if(this.graveyard.includes(hero))
		{
			Engine.warn(`Gov'nor, the hero's tombstone is already in the graveyard when we tried to bury 'im!`);
			return;
		}
		hero.active = false;
		this.graveyard.push(hero);
		
		this.heroes = this.heroes.filter(hero => hero.active);
	},
	
	retire_hero: function(hero)
	{
		this.map.unplopObject(hero);
		
		this.heroes = this.heroes.filter(element => element !== hero);
	},
	
	register_town: function(town)
	{
		this.towns.push(town);
	},
	
	deregister_town: function(town)
	{
		this.towns = this.towns.filter(town => town.active);
		this.map.unplopObject(town);
	},
	
	battle: function(agent1, agent2)
	{
		if(!agent1 || !agent2)
		{
			Engine.warn(`Either one or more agents are not valid agents.`);
			return;
		}
		
		if(!agent1.active || !agent2.active) 
		{
			Engine.log(`One of the agents is already dead.`);
			Engine.log(agent1);
			Engine.log(agent2);
			return;
		}
		
		// we go on for 100 rounds, or until one side is dead. either works.
		for(var i = 0; i < 100; i++)
		{
			agent1.attack(agent2);
			agent2.attack(agent1);
			
			if(!agent1.active || !agent2.active) break;
		}
	},
	
	tick: function()
	{
		this.year++;
		this.map.tick();
		this.generate_monsters(1);
		
		if(this.year % this.time_per_generation === 0)
		{
			this.new_generation();
		}
	},
	
	log: function(message)
	{
		this.message_log.push(`Y${this.year}: ${message}`);
		Engine.log(message);
	},
}