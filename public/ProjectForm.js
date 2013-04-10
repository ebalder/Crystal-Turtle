

function initDialog(){
	$('#newProject').on('submit', submitForm);
}
function submitForm(){
	$.post('../submitProject' + '/s', $("#newProject").serialize(), function(data){
		$('body').append(data);
	});
	return false;
}