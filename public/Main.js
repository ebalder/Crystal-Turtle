
$(document).on('ready', init);

function init(){
	if(localStorage.sid != null){
		sessionStorage.user = localStorage.user;
		sessionStorage.email = localStorage.email;
		sessionStorage.pass = localStorage.pass;
		sessionStorage.sid = localStorage.sid;
	}
	console.log(sessionStorage.sid, sessionStorage.user);
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
		$.get(url + "/s" + "?sid=" + sessionStorage.sid, function(data){
			$('body').append('<div class="dialog">' + data + '</div>');
			$('.dialog').on('click', stopPropagation);
			typeof(initDialog) != "undefined" ? initDialog() : null;
			$('.dialog form').one('submit', function(){
				typeof(initDialog) == "undefined" ? submitForm() : null;
				return false;
			});
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
