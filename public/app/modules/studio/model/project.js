
define(function(require){
	var Timestamp = require('model/timestamp');
	var Scene = require('model/scene');

	var canvas = require('studio/canvas');
	var fs = require('fs');

	// canvas.init();

	function create() {
	}
	function del(){
	}
	function duplicate(dest){
	}
	function join(to){
	}
	function load(ts){	
		
	}
	function newScene(){
		
	}
	function preview(){
	}
	function save(){
	}
	function split(point){
	}

	function Project(name){
		this.clips = [];
		this.name = name;
		this.scenes = [new Scene('test')];
		this.activeScene = this.scenes[0];
		this.start;
		this.end;
		this.length;
		this.index;
		this.reference;

		/* Constructor */
		Scene.prototype.setParent(this);
		load();
	}
	Project.prototype = {
		create: create,
		del: del,
		duplicate: duplicate,
		join: join,
		load: load,
		preview: preview,
		save: save,
		split: split,
	};

	return Project;

})