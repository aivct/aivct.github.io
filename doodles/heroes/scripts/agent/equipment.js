function Equipment(power_level, type)
{
	this.power_level = power_level;
	this.type = type;
	
	switch(type)
	{
		case "weapon":
			this.power = random_integer(power_level * (1 - 0.5), power_level * (1 + 0.5));
			break;
		case "armour":
			this.power = random_integer(power_level * (1 - 0.5), power_level * (1 + 0.5));
			break;
		default:
			this.power = random_integer(power_level * (1 - 0.5), power_level * (1 + 0.5));
			break;
	}	
}