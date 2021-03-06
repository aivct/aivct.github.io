/**
	Stores all player based data. Stores it in a special data variable.
	A reminder to please only save AT THE END OF A TICK.
	Stores 
		- Money 
		- Time 
		- Map 
		- Inventory
		- Economy
 */
var State_manager = (
	function()
	{
		var data = {};
		var listeners = [];
		
		function State_listener(name,category,id,action)
		{
			this.name = name;
			this.category = category;
			this.id = id;
			this.action = action;
		}
		
		State_listener.prototype.trigger = function(category,id)
		{
			if(category === this.category && id === this.id)
			{
				this.action(category,id);
			}
		}
		
		return {
			get data() {return data},
			
			initialize: function()
			{
				/* takes the categories and initializes them */
				data["player"] = {};
				data["world"] = {};
				
				// temp until saving and loading is figured out 
				State_manager.start_new_game();
			},
			
			// if there are no previous saves, population data with defaults.
			start_new_game: function()
			{
				data["world"] = {}
			},
			
			set_state: function(category,id,value)
			{
				if(data[category])
				{
					data[category][id] = value;
					listeners.forEach(listener => listener.trigger(category,id));
				}
				else 
				{
					Engine.log("Set Data: No such category: " + category + " exists.");
				}
			},
			
			/**
				For convienience
			 */
			add_state: function(category,id,value)
			{
				if(data[category])
				{
					if(typeof data[category][id] !== "object")
					{
						State_manager.set_state(category,id
							,State_manager.get_state(category,id) + value);
					}
				}
				else 
				{
					Engine.log("Add Data: No such category: " + category + " exists.");
				}
			},
			
			get_state: function(category,id)
			{
				if(data[category])
				{
					// if no id, we assume it's the category being requested
					if(id === undefined) return data[category]
					return data[category][id];
				}
				else 
				{
					Engine.log("Get Data: No such category: " + category + " exists.");
				}
			},
			
			/**
				Note, no two listeners should not have the same name. 
			 */
			add_listener: function(name,category,id,action)
			{
				listeners.push(new State_listener(name,category,id,action));
			},
			
			/**
				Note, fails silently 
			 */
			remove_listener: function(name)
			{
				listeners = listeners.filter(listener => listener.name !== name);
			},
			
			export_data: function()
			{
				Engine.log("Stringifying data for pasta... ");
				try 
				{
					return JSON.stringify(data);
				}
				catch(exception)
				{
					Engine.log(`Unable to stringify data, exception: ${exception.message}`);
				}
			},
			
			import_data: function(data_string)
			{
				var imported_data;
				
				Engine.log("Importing pasta...");
				
				try 
				{
					imported_data = JSON.parse(data_string);
				}
				catch(exception)
				{
					Engine.log(`Unable to parse data, exception: ${exception.message}`);
				}
				
				for(var key in imported_data)
				{
					Engine.log(`Pasta ${key} is being added`);
					// this will add unnecessary info, but that's fine. What's important is that we get the right initializations in.
					data[key] = imported_data[key];
				}
			},
			
			load: function()
			{
				
			},
			
			save: function()
			{
				
			},
		}
	}
)();
