/**
	````````````````````````````
	The bob john who'll have to do everything.
	@author laifrank2002
	@date 2020-02-03
 */
function Hero(predicted_hero_score)
{
	var gs = this.generator_settings;
	
	this.phs = Math.max(Math.min(predicted_hero_score, 100),0);
	if(this.phs !== predicted_hero_score) Engine.warn(`Attempted to create a character with PHS of ${predicted_hero_score}, using PHS of ${this.phs} instead.`);
	this.strength = Math.min(gs.strength.max, gs.strength.min + random_integer(this.phs * gs.strength.multiplier * (1 - 0.5), this.phs * gs.strength.multiplier * (1 + 0.5)));
	this.endurance = Math.min(gs.endurance.max, gs.endurance.min + random_integer(this.phs * gs.endurance.multiplier * (1 - 0.5), this.phs * gs.endurance.multiplier * (1 + 0.5)));
	this.agility = Math.min(gs.agility.max, gs.agility.min + random_integer(this.phs * gs.agility.multiplier * (1 - 0.5), this.phs * gs.agility.multiplier * (1 + 0.5)));
	
	Agent.call(this 
		,(this.endurance + this.strength) * this.HEALTH_MULTIPLIER
		,this.endurance 
		,this.agility + this.strength
		,this.agility);
		
	this.type = "hero";
	
	this.name = random_name() + " " + random_name();
	this.loot = 0;
	this.gold = 0;
	this.xp = 0;
	this.level = this.phs;
	
	this.score = 0;
	this.statistics = {
		kills: 0,
		dungeon_clears: 0,
	}
	
	this.retired_town = null;
	
	this.equipment = {"weapon":null,"armour":null};
}

Hero.prototype = Object.create(Agent.prototype);
Object.defineProperty(Hero.prototype, 'constructor', {
	value: Hero,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
Hero.prototype.generator_settings = {
	strength:{
		multiplier: 0.5,
		max: 100,
		min: 1,
	},
	endurance:{
		multiplier: 0.5,
		max: 100,
		min: 1,
	},
	agility:{
		multiplier: 0.5,
		max: 100,
		min: 1,
	},
}

Hero.prototype.HEALTH_MULTIPLIER = 5;

Hero.prototype.calculate_stats = function()
{
	var weapon_attack = 0;
	if(this.equipment["weapon"])
	{
		weapon_attack = this.equipment["weapon"].power;
	}
	this.damage = this.agility + this.strength + weapon_attack;
	
	var armour_defense = 0;
	if(this.equipment["armour"])
	{
		armour_defense = this.equipment["armour"].power;
	}
	this.defense = this.agility;
	
	this.max_hitpoints = (this.endurance + this.strength) * this.HEALTH_MULTIPLIER;
	this.max_stamina = this.endurance;
}

Hero.prototype.die = function(killer)
{
	Agent.prototype.die.call(this,killer);
	if(!this.retired_town) World.remove_agent(this);
	World.bury_hero(this);
		
	var retire_string = "";
	if(this.retired_town)
	{
		this.retired_town.bury_resident(this);
		retire_string = `They died valiantly defending their town. The little burg of ${this.retired_town.population + 1} now has one less.`;
	}
	
	var success_string = "";
	if(this.predict_hero_score() < this.score)
	{
		success_string = `They were a hero, as they have beaten their predicted hero score of ${this.predict_hero_score()} with a score of ${this.score}.`;
	}
	else 
	{
		success_string = `They were a dismal failure, as they have failed to beat their predicted hero score of ${this.predict_hero_score()} with a score of ${this.score}.`;
	}
	this.log(`Hero ${this.name} dies. They were only ${this.age} at the time. ${success_string} ${retire_string}`);
}

Hero.prototype.attack = function(agent)
{
	Agent.prototype.attack.call(this,agent);
	/*
	// if we've killed 'im, then we'll be rich!
	if(agent.is_dead() && agent.type === "monster")
	{
		var loot = agent.loot();
		this.log(`Hero ${this.name} kills monster. Receives ${loot} loot.`);
		this.loot += agent.loot();
	}*/
}

Hero.prototype.on_kill = function(agent)
{
	if(agent.type === "monster")
	{
		var drop = agent.loot();
		
		var xp = Math.floor(Math.pow(agent.power_level,2) / Math.pow(this.level + 1,2));
		this.log(`Hero ${this.name} kills monster. Receives ${drop.loot} loot, ${drop.gold} gold, and ${xp} xp.`);
		this.loot += drop.loot;
		this.gold += drop.gold;
		this.receive_xp(xp);
		
		this.score += agent.power_level; 
		this.statistics.kills++;
	}
}

Hero.prototype.on_dungeon_clear = function()
{
	this.statistics.dungeon_clears++;
}

Hero.prototype.receive_xp = function(amount)
{
	this.xp += amount;
	if(this.xp >= this.level + 1) 
	{
		this.xp -= this.level + 1;
		this.level_up();
	}
}

// no full healing!
// or relative healing.
// instead, we do absolute healing.
Hero.prototype.level_up = function()
{
	this.level++;
	
	var strength = random_integer(1,2);
	var endurance = random_integer(1,2);
	var agility = random_integer(1,2);
	
	this.strength += strength;
	this.endurance += endurance;
	this.agility += agility;
	
	this.calculate_stats();
	this.hitpoints += (strength + endurance) * this.HEALTH_MULTIPLIER;
	this.log(`Hero ${this.name} has leveled up!`);
}

Hero.prototype.print_log = function()
{
	for(var i = 0; i < this.message_log.length; i++)
	{
		console.log(this.message_log[i]);
	}
}

Hero.prototype.retire = function(town)
{
	World.retire_hero(this);
	var success_string = "";
	if(this.predict_hero_score() < this.score)
	{
		success_string = `They were a hero, as they have beaten their predicted hero score of ${this.predict_hero_score()} with a score of ${this.score}.`;
	}
	else 
	{
		success_string = `They were a dismal failure, as they have failed to beat their predicted hero score of ${this.predict_hero_score()} with a score of ${this.score}.`;
	}
	this.log(`Hero ${this.name} has retired at an age of ${this.age}.${success_string}`);
	
	this.retired_town = town;
}

/* 
	based off of two things 
	1. monsters killed 
		-a level 1 char should kill level 0 monsters AND level 1 monsters. the sum of this series is just gauss's sum.
	2. time alive 
		-more complicated, but we'll assume it's linear for now; so then, a level 0 char should survive 1/100 times as long as a level 100 char.
 */
Hero.prototype.predict_hero_score = function()
{
	return Math.pow(Math.floor((1 + this.phs) / 2),2);
}

Hero.prototype.sell_loot = function(town)
{
	town.buy_loot(this);
}

Hero.prototype.buy_equipment = function(town)
{
	for(var type in this.equipment)
	{
		if(!this.equipment[type] || (this.equipment[type].power_level < this.level) && (town.development > this.equipment[type].power_level))
		{
			// only buy if we can get stronger by buying
			town.sell_equipment(this, type);
		}
	}
}

/*
Hero.prototype.heal = function()
{
	this.hitpoints = this.max_hitpoints;
}

Hero.prototype.rest = function()
{
	this.stamina = Math.max(this.max_stamina, this.stamina + 1);
}
*/