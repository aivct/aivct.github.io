/**
	A school offers courses.
	Mostly a class that provides information.
	
	@author laifrank2002
	@date 2020-02-16
 */
 
function removeElement(array, element)
{
	for(var index = 0, length = array.length; index < array.length; index++)
	{
		if(array[index] === element)
		{
			array.splice(index,1);
			return true;
		}
	}
	return false;
}

function replaceElement(array, element, newElement)
{
	for(var index = 0, length = array.length; index < array.length; index++)
	{
		if(array[index] === element)
		{
			array.splice(index,1,newElement);
			return true;
		}
	}
	return false;
}

function addUniqueElement(array, element)
{
	if(!array.indexOf(element) > -1)
	{
		array.push(element);
	}
}

function addUniqueElements(array, elementsToAdd)
{
	for(var index = 0, length = elementsToAdd.length; index < length; index++)
	{
		if(!array.indexOf(elementsToAdd[index]) > -1)
		{
			array.push(elementsToAdd[index]);
		}
	}
}

export {removeElement, replaceElement, addUniqueElement, addUniqueElements};