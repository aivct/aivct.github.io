import MapObject from "./map_object.js";
import * as Random from "./utilities/random.js";

class Creature extends MapObject
{
	constructor(level = 0)
	{
		super("creature");
		
		this.level = level;
		
		this.maxHitpoints = 10 + level * 4;
		this.attack = 4 + level * 1;
		this.defense = 0;
		
		this.isDead = false;
		
		this.healMax();
		
		this.direction = Random.randomCardinalDirectionVector();
	}
	
	getKillExperience()
	{
		return 1;
	}
	
	getHitpointsPercentage()
	{
		if(this.maxHitpoints <= 0) 
		{
			console.warn(`Invalid max hitpoints.`);
			return 0;
		}
		if(this.hitpoints < 0) return 0;
		return this.hitpoints / this.maxHitpoints;
	}
	
	attackCreature(creature)
	{
		creature.receiveDamage(this, this.attack);
	}
	
	heal(amount)
	{
		this.hitpoints += amount;
		if(this.hitpoints > this.maxHitpoints) this.hitpoints = this.maxHitpoints;
	}
	
	healMax()
	{
		this.hitpoints = this.maxHitpoints;
	}
	
	receiveDamage(creature, amount)
	{
		if(this.isDead) return false;
		var damage = amount;
		damage = Math.max(0, amount - this.defense);
		this.hitpoints -= damage;
		if(this.hitpoints < 0) this.onDie(creature);
	}
	
	onDie(killer) 
	{
		this.isDead = true;
		if(!killer) return;
		killer.onKill(this);
	}
	
	onKill(victim) {}
	
	getDirection()
	{
		return this.direction;
	}
	
	getClosestDirectionTo(target)
	{
		var difference = target.getPosition().clone();
		difference.minus(this.getPosition());
		
		// special case which should NEVER be triggered normally
		if(difference.x === difference.y && difference.y === 0) return new Vector(0,0);
		// if it's a tie, doesn't matter pick one.
		if(Math.abs(difference.x) > Math.abs(difference.y))
		{
			if(difference.x > 0)
			{
				return new Vector(1,0);
			}
			else 
			{
				return new Vector(-1,0);
			}
		}
		else 
		{
			if(difference.y > 0)
			{
				return new Vector(0,1);
			}
			else 
			{
				return new Vector(0,-1);
			}
		}
	}
	
	changeDirection(directionVector)
	{
		this.direction = directionVector;
		if(!directionVector)
		{
			this.direction = Random.randomCardinalDirectionVector();
		}
	}
}

export default Creature;