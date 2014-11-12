
define(function(require){
	var Timestamp = require('model/timestamp');
	var Camera = require('model/camera');
	var Layer = require('model/layer');

	var parent;

	function load () {
		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');
		var active = parent.activeFrame;
		if(active){
			active.uri = canvas.toDataURL();
		}
		canvas.width = canvas.width;
		if(this.uri){
			var img = new Image();
			img.onload = function(){
			  ctx.drawImage(img,0,0);
			};
			img.src = this.uri;
		}
		parent.activeFrame = this;
		console.log(fs);
		return true;
	}
	function setParent (clip) {
		parent = clip;
	}

	function Frame(index, base){
			this.bound = []; /* frame extension */
			this.camera;
			this.layers = [];
			this.reference;
			this.timestamp;
	}

	Frame.prototype = {
		delete: function(){
		},
		duplicate: function(){
		},
		load: load,
		move: function(){
		},
		new: function(){
		},
		parent: parent,
		save: function(){
		},
		setParent: setParent
	};
	return Frame;
})