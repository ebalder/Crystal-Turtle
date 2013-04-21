

function initDialog(){
	$('#newProject').on('submit', submitForm);
}
function submitForm(){
	$.post('../submitProject', $("#newProject").serialize() + "&user=" + sessionStorage.user + "&sid=" + sessionStorage.sid, function(data){
		$('body').append(data);
	});
	return false;
}