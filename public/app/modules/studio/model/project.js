
define(function(require){
	var Timestamp = require('model/timestamp');
	var Scene = require('model/scene');
	var carrousel = require('studio/carrousel');

	function create() {
	}
	function del(){
	}
	function duplicate(dest){
	}
	function join(to){
	}
	function load(ts){	
		
		console.log(cfs.open);
		document.documentElement.dispatchEvent(cfs.open);
	}
	function newScene(){
		
	}
	function preview(){
	}
	function save(){
	}
	function split(point){
	}

	function Project(){
		this.clips = [];
		this.start;
		this.end;
		this.length;
		this.index;
		this.reference;

		/* Constructor */
	}

	var self = Project;

	self.prototype = {
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