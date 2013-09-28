define(function()){
	function submit(){
		$.post('/submitProject', $("#newProject").serialize() + "&user=" + sessionStorage.user + "&sid=" + sessionStorage.sid, function(data){
			$('body').append(data);
		});
		return false;
	}
	return 1;
});

