
function submitForm(){
	$.post('/login', $("#login").serialize(), function(data){
		var remember;
		$('.dialog [name="remember"]:checked').length > 0 ? remember = true : remember = false;
		$('body').trigger('click');
		sessionStorage.user = data.user;
		sessionStorage.email = data.email;
		sessionStorage.sid = data.sid;
		console.log(sessionStorage);
		console.log(localStorage);
		if(remember){
			if(typeof(Storage) != "undefined"){
				localStorage = data;
			} else {
				console.log("Sorry! no web storage support.");
			}
		}
		Navigation.login();
	});
}