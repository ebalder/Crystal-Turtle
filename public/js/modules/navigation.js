
define(['lib/jquery'], function(){
	/* private vars */
	var test = 10;
	function destroyDialog(event){
		$('.dialog').remove();
	}
	function stopPropagation(event){
		console.log("propStopped");
		event.stopPropagation();
		return true;
	}

	var navigation = {
		login : function(){
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
			var url =  ev.target.href; 
			var path = ev.target.pathname.replace('/', '');
			$('body').trigger('click'); //close panel if opened
			$.get(url + "?sid=" + sessionStorage.sid, function(data){
				$('body').append('<div class="dialog">' + data + '</div>');
				$('.dialog').on('click', stopPropagation);
				$('.dialog').css({'z-index' : 99});
				requirejs([path], function(dialog){
					$('.dialog form').one('submit', function(){
						dialog.submit();
						$('body').trigger('click'); //close panel if opened
						return false;
					});
				});
				$('body').one('click', destroyDialog);
			});
			return false;
		},
		/* when the page changes completely */
		open : function(ev){
			$('#area').empty();
			var url = ev.target.href + "/";
			var path = ev.target.pathname;
			var patt = new RegExp("^\/user\/");
			if(patt.test(path)){
				path = "userProfile";
			}  
			window.history.pushState(url, url, url);
			$.post(url, sessionStorage, function(data){
				$('#area').html(data);
				$('#area .load').on('click', navigation.load);
				$('#area .open').on('click', navigation.open);
				requirejs([path], function(page){
					
				});
			});
			$('body').trigger('click'); //close panel if opened
			return false;
		},
		/* when the user reaches the current page via url (paths are simulated) */
		hash : function(path){
			path = path.split('/')[1];
			$.post(window.location.href, sessionStorage, function(data){
				$('#area').html(data);
				$('#area .load').on('click', navigation.load);
				$('#area .open').on('click', navigation.open);
			});
			requirejs([path], function(page){

			});
		},
		stopPropagation : stopPropagation
	};
	return navigation;
})();
