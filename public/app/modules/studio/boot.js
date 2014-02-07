

define(function(require){

	var carrousel = require('studio/carrousel');
	var panel = require('studio/sidePanel');
	var issues = require('studio/issues');
	var canvas = require('studio/canvas');

	var Project = require('model/project');

	var pName = window.location.pathname.split( '/' )[2];
	var project = new Project(pName);

	//Aquí no tiene efecto navigation.js, así que por ahora
	//Se deja aqui la funcion de destroyDialog para que los issues funcionen.
	/* ToDo: applicar navigation.js */
	function destroyDialog(event){
		$('.dialog').remove();
	}

	$("#nIssue").on('click', issues.new);
	$('a.expand').on('click', function(ev){
	    $('body').one('click', destroyDialog);
		var data = $(ev.target).parents('div:first').html();
		$('body').append('<div class="dialog">' + data + '</div>');
		return false;
	});

	// canvas.init(); 
	return 0;
});





