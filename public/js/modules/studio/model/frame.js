
define(function(require){
	var Timestamp = require('timestamp');
	var Camera = require('camera');
	var Layer = require('layer');
	
	return function(reference){
		this.bound = []; /* frame extension */
		this.camera;
		this.layers = [];
		this.reference = reference;
		this.timestamp;

		var self = this;

		this.prototype = {
			delete: function(){
			},
			duplicate: function(){
			},
			load: function(){
			},
			move: function(){
			},
			new: function(){
			},
			save: function(){
			},
		};
		
		/* Constructor */
	}
})