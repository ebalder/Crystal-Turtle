
define(function(require){
	var Timestamp = require('model/timestamp');
	var Frame = require('model/frame');

	var fs = require('fs');
	var pinboard = require('studio/pinboard');
	var carrousel = require('studio/carrousel');

	var parent;
	
	function openFrame (index) {
		
	}
	function del(){
	}
	function duplicate(dest, linked){
	}
	function join(to){
	}
	function load(){
		pinboard.clipInfo(this);
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
	function setParent (scene) {
		parent = scene;
	}
	function split(point){
	}

	function Clip(index, base){
		this.end;
		this.activeFrame;
		this.frames = [];
		this.index = index;
		this.reference;
		this.script;
		this.start;
		this.timestamp = null;

		Frame.prototype.setParent(this);
		carrousel.addClipThumb(this);

		/* ToDo: get all from fs */
		var frameCache = Math.ceil($('body').width() / 15 + 12);
		for (var i = 0; i <= frameCache; i++){
			this.frames.push(new Frame(i, this.start));
		}
		carrousel.setFrameArray(this.frames);

	}

	Clip.prototype = {
		load: load,
		openFrame : openFrame,
		parent: parent,
		setParent: setParent
	};

	return Clip;
})