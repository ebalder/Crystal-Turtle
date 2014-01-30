define(function(require){
	var carrousel = require('studio/carrousel');
	var panel = require('studio/sidePanel');
	var issues = require('studio/issues');
	// var Project = require('model/project');
	// var projectM = new Project();
	// projectM.load();

	//Aquí no tiene efecto navigation.js, así que por ahora
	//Se deja aqui la funcion de destroyDialog para que los issues funcionen.
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
	return 0;
	var project = window.location.pathname.split( '/' )[2];
});





