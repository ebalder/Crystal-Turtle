

define(['studio/carrousel', 'studio/sidePanel', 'studio/issues'], function(carrousel, panel, issues){
	//var carrousel = require('studio/carrousel');
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





