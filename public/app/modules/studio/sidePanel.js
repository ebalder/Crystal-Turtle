
define(['lib/jquery', 'lib/jquery-ui','studio/pinboard', 'navigation'], function($,ui, pinboard, nav){ /* ToDo: make a utils module with a stopPropagation method */
	var timestamp = "0:00:00.00";
	var cssShow = {'left' : '0%' , 'padding-left' : '10px'};
	var cssHide = {'left' : '-35%', 'padding-left': '20px'};

	var panel = {
		hide : function (){ 
			$('body').off('click', self.hide);
			$('#panel').css(cssHide);
			$('#panTab').one('click', self.show);
			return 1;
		},
		show : function(){
			timestamp = pinboard.timestamp;
			$('#panel').css(cssShow); 
			$('#panel').on('click', nav.stopPropagation); //click al panel no lo oculta
			$('body').one('click', self.hide);
			$('#panTab').one('click', self.hide);
			return 1;
		},
		triggerHide : function(){
			$("#panTab").trigger('click');
			return 1;
		}
	};
	
	var self = panel;
	panel.hide();
	$('.fragInfo').tabs({
		heightStyle: "fill",
		active: 0,
      	event: 'mouseover'
	});
	return panel;
});