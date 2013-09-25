
define(function(){
	/* private vars here */
	return {
		login : function(ev){
			if (localStorage.sid != null){
				sessionStorage.user = localStorage.user;
				sessionStorage.email = localStorage.email;
				sessionStorage.pass = localStorage.pass;
				sessionStorage.sid = localStorage.sid;
			}
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
		/* When there is a dialog or adition to the current page */
		load : function(ev){
			var url = ev.target.href;
			$('body').trigger('click'); //close panel if opened
			$.get(url + "?sid=" + sessionStorage.sid, function(data){
				$('body').append('<div class="dialog">' + data + '</div>');
				$('.dialog').on('click', stopPropagation);
				$('.dialog').css({'z-index' : 99});
				typeof(initDialog) != "undefined" ? initDialog() : null;
				$('.dialog form').one('submit', function(){
					typeof(initDialog) == "undefined" ? submitForm() : null;
					$('body').trigger('click'); //close panel if opened
					return false;
				});
				$('body').one('click', destroyDialog);
			});
			return false;
		},
		/* when the page changes completely */
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
		},
		/* when the user reaches the current page via url (paths are simulated) */
		hash : function(path){
			$.post(window.location.href, sessionStorage, function(data){
				$('#area').html(data);
				/* prevent from executing both _init functins (it happens!) */
				typeof(initArea) == 'function' ? initArea() : null ;
				$('#area .load').on('click', nav.load);
				$('#area .open').on('click', nav.open);
			});
		}
	}
})();
