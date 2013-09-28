
define(['navigation'], function(nav){
		var form = $('#newUser input:not([type="submit"])');
	return {
		submit : function(){
			$.post('/submitUser', $("#newUser").serialize(), function(data){
				$('.msg').empty();
				$('.msg').append(data);
				localStorage.user = data.user;
				localStorage.email = data.email;
				localStorage.pass = data.pass;
				localStorage.sid = data.sid;
				nav.login();
			});
			return false;
		}
	};
});

