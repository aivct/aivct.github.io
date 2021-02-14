function normalize_number(number,lower, upper)
{
	if(number < lower) return lower;
	if(number > upper) return upper;
	return number;
}

function normalize_number_string(string)
{
	var number = Number(string);
	if(number)
	{
		// we trim off the excess leading 0s
		return number.toString();
	}
	return string;
}

function pad_number(number, places, character = "0")
{
	var number_string = number + "";
	for(var index = number_string.length; index < places; index++)
	{
		number_string = character + number_string;
	}
	return number_string;
}

// floor to keep it consistent.
function random_integer(min, max)
{
	return Math.floor(random_number(min,max));
}

function random_number(min, max)
{
	return (Math.random() * (max - min)) + min;
}