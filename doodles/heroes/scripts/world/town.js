// towns represent a fixed level of investment in this world.
// development consumes resources. however, there is a certain level of "fixed" development that comes with certain requirements.
// one of the easiest ones is the "people" requirement, which'll increase your population by so much.

function Town(settlers)
{
	MapObject.call(this, 1, 1);
	this.type = "town";
	this.movable = false;
	
	// setting up settlers
	settlers.forEach(hero => hero.retire(this));
	this.resources = 0;
	settlers.forEach(hero => {this.resources += hero.loot / this.LOOT_TO_RESOURCE_RATIO; hero.loot = 0});
	this.gold = 0;
	settlers.forEach(hero => {this.gold += hero.gold; hero.gold = 0});
	this.population = settlers.length;
	this.residents = settlers;
	
	this.fame = 0;
	this.development = 1;
	
	this.leader = this.residents[0];
	
	this.message_log = [];
	
	World.log(`A town has formed! Under the watchful eyes of its leader, ${this.residents[0].name}, it will surely grow and prosper. It currently has a population of ${this.population} people, with a treasury of ${this.gold} gold and a warehouse full of ${this.resources} resources.`);
	World.register_town(this);
}

Town.prototype = Object.create(MapObject.prototype);
Object.defineProperty(Town.prototype, 'constructor', {
	value: Town,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

Town.prototype.DEFAULT_LOOT_PRICE = 1; // one loot is one gold. pretty fair I guess
Town.prototype.LOOT_TO_RESOURCE_RATIO = 1;

// exchanges loot for gold
Town.prototype.buy_loot = function(hero)
{
	var loot = hero.loot;
	var price = this.DEFAULT_LOOT_PRICE;
	
	if(loot * price > this.gold) loot = this.gold / price;
	
	hero.loot -= loot;
	hero.gold += loot * price;
	
	this.resources += loot / this.LOOT_TO_RESOURCE_RATIO;
	this.gold -= loot * price;
}

Town.prototype.sell_equipment = function(hero, type)
{
	var level = Math.min(hero.level, this.development);
	
	if(hero.gold >= level)
	{
		if(this.resources > level)
		{
			var equipment = new Equipment(level, type);
			hero.equipment[type] = equipment;
			hero.gold -= level;
			this.resources -= level;
		}
	}
}

Town.prototype.retire_hero = function(hero)
{
	this.log(`Hero ${hero.name} has decided to join our town! We are richer for their presence.`);
	hero.retire(this);
	this.gold += hero.gold;
	hero.gold = 0;
	this.resources += hero.loot / this.LOOT_TO_RESOURCE_RATIO;
	hero.loot = 0;
	this.residents.push(hero);
	this.population++;
}

Town.prototype.bury_resident = function(resident)
{
	this.log(`Resident ${resident.name} has died valiantly defending the town. We mourn their loss.`);
	this.residents = this.residents.filter(resident => resident.active);
	this.population--;
	// if the population is less than 1, the town dies.
	if(this.population < 1) this.die();
}

Town.prototype.die = function()
{
	World.log(`The last resident of the town is now dead. We mourn its loss, but feel no great sadness in its demise, for life goes on.`);
	this.active = false;
	World.deregister_town(this);
}

Town.prototype.get_random_resident = function()
{
	return this.residents[random_integer(0, this.residents.length)];
}

// each tick produces some miniscule amount of gold 
Town.prototype.tick = function()
{
	this.gold += Math.floor(Math.sqrt(this.population));
	// we increase development by consuming resources. The more, the more. 
	this.resources -= this.development;
	if(this.resources < 0)
	{
		this.resources+=this.development*100;
		this.development--;
	}
	else if (this.resources > (this.development * 2) * 100) // just so the town can have enuff
	{
		this.resources -= (this.development + 1) * 100;
		this.development++;
	}
	// age all its residents.
	this.residents.forEach(resident => resident.tick());
}

Town.prototype.new_era = function()
{
	this.residents.forEach(resident => resident.heal_max());
	// as a precautionary, some residents may decide to leave 
}

Town.prototype.log = function(message)
{
	// take the current year of the world.
	this.message_log.push("Y" + World.year + ": " + message);
}