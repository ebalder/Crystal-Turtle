
$(document).on('ready', inicio);

function inicio(){
	$('#newProject').on('submit', submitProject);
}
function submitProject(){
	$.post('submitProject', $("#newProject").serialize(), function(data){
		$('body').append(data);
	})
	return false;
}