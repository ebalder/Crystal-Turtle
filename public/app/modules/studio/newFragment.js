
define(function(){
	$('#newFragment').on('submit', submitFrag);
	$('.addLine').on('click', newLine);

	function newLine(ev){
		if ($(ev.target).attr('name') == "addAction"){
			$('#lines').append('<input type="text" name="action" focused/>');
			$('#lines input:last').focus();
		} else if ($(ev.target).attr('name') == "addDialog"){
			$('#lines').append('\
				<span class="line">\
					<input type="text" name="character"/> : \
					<br><textarea name="dialog" cols="35" rows="2"/>\
				</span>');
			$('#lines input:last').focus();
		}
	}
	function  submitFrag(){
		var script = {};
		script.lines = [];
		script.annotation = $('[name="fragDesc"]').val();
		$.each($('#lines input'), function(index, value){
			if($(value).attr('name') == 'action'){
				script.lines[index] = {
					action : $(value).val()
				}
			} else if ($(value).attr('name') == 'character'){
				script.lines[index] = {
					chara : $(value).val(),
					dialog : $(value).siblings('textarea').val()
				}
			}
		});
		script.flag = 2;
		script.sid = sessionStorage.sid;
		$.post('/submitScript', script);
		return false;
	}
	return 1;
});


