/**
	A default entity for use in combat.
	Basically: has hitpoints, and attack, and defense, and, fatigue, and... uh... that's about it.
 */
function Agent(hitpoints = Agent.prototype.DEFAULT_HITPOINTS
	,max_stamina = Agent.prototype.DEFAULT_STAMINA
	,damage = Agent.prototype.DEFAULT_DAMAGE
	,defense = Agent.prototype.DEFAULT_DEFENSE)
{
	MapObject.call(this, 1, 1);
	this.max_hitpoints = hitpoints;
	this.hitpoints = this.max_hitpoints;
	this.max_stamina = max_stamina;
	this.stamina = this.max_stamina;
	this.damage = damage;
	this.defense = defense;
	
	this.type = "agent";
	
	this.engaged = false;
	
	this.age = 0;
	this.active = true;
	this.movable = true;
	
	// targetting
	this.target = null;
	
	this.message_log = [];
}

Agent.prototype = Object.create(MapObject.prototype);
Object.defineProperty(Agent.prototype, 'constructor', {
	value: Agent,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
 
Agent.prototype.DEFAULT_HITPOINTS = 3;
Agent.prototype.DEFAULT_STAMINA = 3;
Agent.prototype.DEFAULT_DAMAGE = 1;
Agent.prototype.DEFAULT_DEFENSE = 1;

Agent.prototype.attack = function(agent)
{
	agent.defend(this.damage, this);
}

Agent.prototype.defend = function(amount, attacker)
{
	var damage = 0;
	if(amount > this.defense) damage = amount - this.defense;
	this.receive_damage(damage, attacker);
}

Agent.prototype.receive_damage = function(amount, attacker)
{
	this.hitpoints -= amount;
	if(this.is_dead()) this.die(attacker);
}

Agent.prototype.is_dead = function()
{
	if(this.hitpoints <= 0) return true;
	return false;
}

Agent.prototype.die = function(killer)
{	
	this.active = false;
	killer.on_kill(this);
}

Agent.prototype.heal_max = function()
{
	this.hitpoints = this.max_hitpoints;
}

Agent.prototype.tick = function()
{
	this.age++;
}

Agent.prototype.on_kill = function(agent)
{
	
}

Agent.prototype.log = function(message)
{
	// take the current year of the world.
	this.message_log.push("Y" + World.year + ": " + message);
}