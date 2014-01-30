
define(function(require){
	var Timestamp = require('model/timestamp');
	var Frame = require('model/frame');


	var canvas = require('studio/canvas');

	var pinboard = require('studio/pinboard');
	
	function openFrame (index) {
		console.log('active', this.active);
		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');
		if(typeof this.active == 'number'){
			this.frames[this.active] = canvas.toDataURL();
		}
		canvas.width = canvas.width;
		if(this.frames[index]){
			var img = new Image();
			img.onload = function(){
			  ctx.drawImage(img,0,0);
			};
			img.src = this.frames[index];
		}
		this.active = index;
		console.log(this.active);
	}
	function del(){
	}
	function duplicate(dest, linked){
	}
	function join(to){
	}
	function load(){
		// pinboard.fragInfo()
	}
	function move(dest){
	}
	function create(start, end, script){
	}
	function preview(){
	}
	function resize(len){
	}
	function save(){
	}
	function scribble(){
	}
	function split(point){
	}

	function Clip(){
		this.end;
		this.active;
		this.frames = [];
		this.index;
		this.reference;
		this.script;
		this.start;
	}

	Clip.prototype = {
		openFrame : openFrame
	};

	return Clip;
})