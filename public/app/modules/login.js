define(['lib/jquery', 'navigation'], function($, nav){
	var submit = function(){
		var remember = $('.dialog input[name="remember"]:checked').length > 0 ? true : false;
		$.post('/login', $("#login").serialize(), function(data){
			console.log(remember);
			if(!data){
				throw new Error('Wrong username or password.');
				return false;
			}
			$('body').trigger('click');
			sessionStorage.user = data.user;
			sessionStorage.email = data.email;
			sessionStorage.sid = data.sid;
			if(remember){
				if(typeof(Storage) != "undefined"){
					localStorage.user = data.user;
					localStorage.email = data.email;
					localStorage.sid = data.sid;
				} else {
					console.log("Sorry! no web storage support. Have you tried an actual browser? :)");
				}
			}
			nav.login();
		});
	};
	return submit;
});
