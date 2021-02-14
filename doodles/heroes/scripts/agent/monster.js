/**
	No, YOU'RE the monster.
	@author laifrank2002
	@date 2020-02-04
 */
function Monster(power_level = 1)
{
	this.power_level = power_level;
	
	Agent.call(this
		,5+random_integer(this.power_level * this.generator_settings.health_multiplier * 0.5, this.power_level * this.generator_settings.health_multiplier * 1.5)
		,5+random_integer(this.power_level * this.generator_settings.stamina_multiplier * 0.5, this.power_level * this.generator_settings.stamina_multiplier * 1.5)
		,1+random_integer(this.power_level * this.generator_settings.damage_multiplier  * 0.5, this.power_level * this.generator_settings.damage_multiplier  * 1.5)
		,1+random_integer(this.power_level * this.generator_settings.defense_multiplier * 0.5, this.power_level * this.generator_settings.defense_multiplier * 1.5));
		
	this.type = "monster";
}

Monster.prototype = Object.create(Agent.prototype);
Object.defineProperty(Monster.prototype, 'constructor', {
	value: Monster,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });	

Monster.prototype.generator_settings = {
	health_multiplier: 2,
	stamina_multiplier: 2,
	damage_multiplier: 0.3,
	defense_multiplier: 0.2,
}
	
Monster.prototype.loot = function()
{
	return {loot: 1 + random_integer(this.power_level * (1 - 0.5), this.power_level * (1 + 0.5))
		, gold: random_integer(this.power_level * (1 - 0.5), this.power_level * (1 + 0.5))};
}

Monster.prototype.die = function(killer)
{
	Agent.prototype.die.call(this,killer);
	World.remove_agent(this);
}