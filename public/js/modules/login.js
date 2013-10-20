define(['lib/jquery', 'navigation'], function($, nav){
	this.submit = function(){
		$.post('/login', $("#login").serialize(), function(data){
			var remember = $('.dialog [name="remember"]:checked').length > 0 ? true : false;
			$('body').trigger('click');
			sessionStorage.user = data.user;
			sessionStorage.email = data.email;
			sessionStorage.sid = data.sid;
			if(remember){
				if(typeof(Storage) != "undefined"){
					localStorage = data;
				} else {
					console.log("Sorry! no web storage support. Have you tried an actual browser? :)");
				}
			}
			nav.login();
		});
	};
	return this;
});
