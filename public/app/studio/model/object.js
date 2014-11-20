
define(function(){
	
	function load (type, ref) {
		
	}

	function Object(ref){
		this.properties;
		this.reference;
		this.type;
		/* Constructor */
		load(type, ref);
	}
	Object.prototype = {
		delete: function(){
		},
		new: function(type){
		},
		save: function(){
		},
		update: function(properties){
		},
	};
	/* Returns a costructor */
	return Object;
})