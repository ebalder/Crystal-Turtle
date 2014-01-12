define(function(){
	$("span:empty").each(function(index, value){
		$(this).text("---");
	});
	$(".data, .paragraph").on('click', function(ev){
		var $container = $(ev.target);
		var aux = $container.text();
		var html = $container.hasClass('paragraph')
			? '<textarea value="' + aux + '" cols="20" rows="4"/>'
			: '<input type="text" value="' + aux + '"/>';
		$container.empty().html(html);
		var $input = $container.find('input, textarea');
		$input.focus();
		$input.on('focusout keypress', function(ev){
			if(ev.which == '13' || ev.which == '9' || ev.type == 'focusout'){
				if ($input.val() != aux){
					var submit = {
						value : $input.val(),
						field : $container.attr('id'),
						sid : sessionStorage.sid
					}
					$container.empty();
					$container.html(submit.value);
					$.post('/submitProfileData', submit, function(data){
					});
				} else{
					$container.empty();
					$container.html(aux);
				}
			}
		});
		return false;
	});
	$("#uImage").one('click', function(){
		$("#uImage").one('keypress change', function(ev){
			if(ev.which == "13" || ev.type == "change"){
				var reader = new FileReader();
				var uri;
				$(reader).on('load', function(ev){
					uri = ev.target.result;
					var submit = {
						image : uri,
						sid : sessionStorage.sid,
						dir : "uImages",
						name : sessionStorage.user,
						type : "jpg"
					};
					$.post('/saveImage', submit, function(data){
					});
				});
				reader.readAsBinaryString(ev.target.files[0]);
			}
		});
	});
});