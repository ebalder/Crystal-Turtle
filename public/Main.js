
$(document).on('ready', init);

function init(){
	if(localStorage.sid != null || sessionStorage.sid != null){
		Navigation.login();
	} else {
		$('a[href="/logout"]').hide();
		$('a[href="/projectForm"]').hide();
	}
	$('.load').on('click', Navigation.load);
	$('.open').on('click', Navigation.open);
	$('.logout').on('click', Navigation.logout);
	if(window.location.pathname != '/'){
		$.post(window.location.href, sessionStorage, function(data){
			$('#area').html(data);
			typeof(initArea) == 'function' ? initArea() : null ;
			$('#area .load').on('click', Navigation.load);
			$('#area .open').on('click', Navigation.open);
		});
	}
}

var Navigation = {
	login : function(ev){
		sessionStorage.user = localStorage.user != null ? localStorage.user : sessionStorage.user;
		sessionStorage.email = localStorage.email != null ? localStorage.email : sessionStorage.email;
		sessionStorage.pass = localStorage.pass != null ? localStorage.pass : sessionStorage.pass;
		sessionStorage.sid = localStorage.sid != null ? localStorage.sid : sessionStorage.sid;
		$('a[href="/login"]').after('<a class="open user" href="/user/' + sessionStorage.user + '"> ' + sessionStorage.user + '</a>');
		$('a[href="/login"], a[href="/userForm"]').hide();
		$('a[href="/logout"]').show();
		$('a[href="/projectForm"]').show();
	},
	logout : function(ev){
		$.post("/logout", {sid : sessionStorage.sid}, function(data){	
			sessionStorage.clear(); 
			delete localStorage.user;
			delete localStorage.email;
			delete localStorage.pass;
			delete localStorage.sid;
			$('.msg').html(data);
			$('.user').remove();
			$('.logout, a[href="/projectForm"]').hide();
			$('a[href="/login"], a[href="/userForm"]').show();
		});
		$('body').trigger('click'); //close panel if opened
		return false;
	},
	load : function(ev){
		var url = ev.target.href;
		$('body').trigger('click'); //close panel if opened
		$.get(url + "?sid=" + sessionStorage.sid, function(data){
			$('body').append('<div class="dialog">' + data + '</div>');
			$('.dialog').on('click', stopPropagation);
			typeof(initDialog) != "undefined" ? initDialog() : null;
			$('.dialog form').one('submit', function(){
		console.log(typeof(initDialog));
				typeof(initDialog) == "undefined" ? submitForm() : null;
				$('body').trigger('click'); //close panel if opened
				return false;
			});
			$('body').one('click', function(){ 
				console.log($('.dialog').html());
				$('.dialog').remove();
				typeof(initDialog) != "undefined" 
					? delete initDialog
					: null;
			});
		});
		return false;
	},
	open : function(ev){
		$('#area').empty();
		delete initArea;
		var url = $(ev.target).attr('href') + "/";
			console.log(url);
		window.history.pushState(url, url, url);
		$.post(url, sessionStorage, function(data){
			$('#area').html(data);
			typeof(initArea) == 'function' ? initArea() : null;
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
