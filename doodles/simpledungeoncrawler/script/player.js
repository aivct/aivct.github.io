import MapObject from "./map_object.js";
import Creature from "./creature.js";

class Player extends Creature
{
	constructor()
	{
		super();
		
		this.maxHitpoints = 100;
		this.attack = 5;
		this.defense = 0;
		
		this.level = 0;
		this.experience = 0;
		this.experienceToNextLevel = 10;
		
		//this.levelUp();
		this.healMax();
	}
	
	addExperience(amount)
	{
		this.experience += amount;
		while(this.experience >= this.experienceToNextLevel)
		{			
			this.experience -= this.experienceToNextLevel;
			// this.levelUp();
			// on the off chance... programmer's hedge
			if(this.experienceToNextLevel < 0)
			{
				console.warn(`Exp to next level is less than 0 (${this.experienceToNextLevel}).`);
				return;
			}
		}
	}
	
	levelUp()
	{
		this.level += 1;
		// try to use a formula instead of iteration, it makes for more consistent and thus cleaner results
		this.experienceToNextLevel = 8 + 10 * this.level;
		this.maxHitpoints = 100 + 10 * this.level;
		this.attack = 10 + 2 * this.level;
		this.defense = 3 + 1 * this.level;
	}
	
	onEncounter(mapObject)
	{
		if(mapObject instanceof Creature)
		{
			this.attackCreature(mapObject);
			mapObject.attackCreature(this);
		}
		else if(mapObject instanceof MapObject)
		{
			if(mapObject.type === "potion")
			{
				this.healMax();
				mapObject.removeFlag = true;
			}
			else if(mapObject.type === "stair")
			{
				this.nextLevelFlag = true;
			}
		}
		
		if(this.hitpoints < 0) console.log(`I'm dead!`);
	}
	
	onDie(killer)
	{
		super.onDie(killer);
	}
	
	onKill(victim)
	{
		var experience = victim.getKillExperience();
		this.addExperience(experience);
	}
}

export default Player;