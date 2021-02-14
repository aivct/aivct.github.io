/**
	Like a town, but for monsters.
	Will periodically spawn more monsters.
	
	Can be destroyed by a hero by attemping to challenge its non-respawnable 'guardians'.
	The trick is that it's not a fair fight; they're fighting over 'n' over 'n' over again till ALL the guardians are dead (there's no turning back!).
	If they do win, they are rewarded with a stupendous amount of xp and gold.
	If not, they die! (but they die a lot anyways).
 */
function Dungeon()
{
	MapObject.call(this, 1, 1);
	this.type = "dungeon";
	this.movable = false;
	
	this.guards = [];
	
}

Dungeon.prototype = Object.create(MapObject.prototype);
Object.defineProperty(Dungeon.prototype, 'constructor', {
	value: Dungeon,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
