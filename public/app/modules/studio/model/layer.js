
define(function(require){
	var Object = require('model/object');

	/* Returns a constructor */
	return function(reference){
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

		this.prototype = {
			delete: function(layer){
			},
			draw: function(){
			},
			duplicate: function(){
			},
			load: function(reference){
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

		/* Constructor */
		this.load(reference);
	}
})