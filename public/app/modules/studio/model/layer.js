
define(function(require){
	var Object = require('model/object');

	function load(ref){
		var obj = this.objects;
		if(!obj[ref]){
			obj[ref] = new Object('canvas');
		}
	}

	function Layer(reference){
		this.blend;
		this.dept;
		this.lock;
		this.name = [];
		this.objects = [];
		this.opacity;
		this.reference = reference;
		this.state;
		this.type;

		var self = this;

		

		/* Constructor */
		load(reference);
	};

	Layer.prototype = {
		delete: function(layer){
		},
		draw: function(){
		},
		duplicate: function(){
		},
		mergeDown: function(){
		},
		move: function(){
		},
		new: function(type){
		},
		pan: function(x, y){
		},
		rotate: function(deg){
		},
		save: function(){
		},
		scale: function(x, y){
		},
		setBlend: function(type){
		},
		setOpacity: function(value){
		},
	};

		/* Returns a constructor */
	return Layer;
})