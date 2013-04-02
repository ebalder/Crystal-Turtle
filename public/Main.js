
$(document).on('ready', init);

function init(){
	$('.load').on('click', Navigation.load);
	$('.open').on('click', Navigation.open);
	if(window.location.pathname != '/'){
		$.get(window.location.href + '/s', function(data){
			$('#area').html(data);
			typeof(initArea) == 'function' ? initArea() : null ;
			$('#area .load').on('click', Navigation.load);
			$('#area .open').on('click', Navigation.open);
		});
	}
}

var Navigation = {
	load : function(ev){
		var url = ev.target.href;
		$.get(url + "/s", function(data){
			$('body').append('<div class="dialog">' + data + '</div>');
			initDialog();
			$('.dialog').on('click', stopPropagation);
			$('body').one('click', function(){ 
				$('.dialog').remove();
			});
		});
		$('body').trigger('click'); //close panel if opened
		return false;
	},
	open : function(ev){
		$('#area').empty();
		delete initArea;
		var url = '/' + $(ev.target).attr('href');
		window.history.pushState(url, url, url);
		$.get(url + "/s", function(data){
			$('#area').html(data);
			typeof(initArea) == 'function' ? initArea() : null ;
			$('#area .load').on('click', Navigation.load);
			$('#area .open').on('click', Navigation.open);
		});
		$('body').trigger('click'); //close panel if opened
		return false;
	}
}

function stopPropagation(event){
	event.stopPropagation();
}
