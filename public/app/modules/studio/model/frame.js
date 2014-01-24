
define(function(require){
	var Timestamp = require('model/timestamp');
	var Camera = require('model/camera');
	var Layer = require('model/layer');

	function Frame(reference){
			this.bound = []; /* frame extension */
			this.camera;
			this.layers = [];
			this.reference = reference;
			this.timestamp;

			var self = this;

			
			
			/* Constructor */
	}

	Frame.prototype = {
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
	return Frame;
})