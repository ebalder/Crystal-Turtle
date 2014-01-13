define(['navigation'], function(nav){
	return{
		submit : function(){
			$.post('/submitProject', $("#newProject").serialize() + "&user=" + sessionStorage.user + "&sid=" + sessionStorage.sid, 
				function(data){
					$('body').append(data);
			});
			return false;
		}
	};	
});

