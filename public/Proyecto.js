var time;

cssShowPanel = {
	'transform' : 'translate(94.5%)'
};

cssHidePanel = {
	'transform' : 'translate(0px)'
};


function fragInfo(){
	index = $('.fragment').index(this) + 1;
	time = $(this).find('.timestamp').text();
	$.post('fragmentInfo', {selection: index}, showData);	
}
function hidePanel(){
	$('#panTab').off('click', hidePanel);
	$("body").off('click', triggerHidePanel);
	$("#panel").css(cssHidePanel);
	$('#panTab').on('click', showPanel);
}
function loadFrag(data){ 
	thumb = data.index; 
	time = data.timestamp;
	$("#tlIn > .fragment:eq(" + (data.index - 1) +")").html('\
		<span class="thumb">\
			<img src ="Frames/' + thumb + '.jpg">\
			</span><!--thumb-->\
		<span class="timestamp">' + time + '</span><!--timestamp-->');
}
function newEntry(){
	$.get("entryForm", function(data){
		$('#contents').html(data);
		$('input[name="timestamp"]').val(time);
		$('#entryForm').on('submit', function(){
			$.post("submitEntry", $('#entryForm').serialize(), function(){
				$('.msg').html("Submission complete");
			});
			return false;
		});
	});
	return false;
}
function showData(data){
	$("#fragmentInfo").html(data);
	$(".new").on('click', newEntry)
}
function showPanel(){
	$('#panTab').off('click', showPanel);
	$('#panel').css(cssShowPanel);
	$("body").on('click', triggerHidePanel);
	$('#panTab').on('click', hidePanel);
}
function stopPropagation(event){
	event.stopPropagation();
}
function triggerHidePanel (){
	$("#panTab").trigger('click');
}
	
function inicio(){
	$('#panel').on('click', stopPropagation); //click al panel no lo oculta
	
	hidePanel();
	
	bodyWidth = $('body').width();
	i = 1; //Cantidad visible
	j = 1; //Mayor cargado
	h = 12; //Fragmentos disponibles
	while ((bodyWidth / ((180+2) * i) >= 1) && j <= h) {
		$("#tlIn").append('\
			<span class="fragment"> \
			</span> <!--fragment-->');
		$('.fragment:eq(' + (j - 1) + ')').on('click', fragInfo);
		$.post('fragmentThumb', {index: j}, loadFrag);
		i++;
		j++;
	}
	i = 1; //menor visible
	k = j; //mayor visible
	$("#fw").on('click', function(){ 
		if(k <= h){
			if (k == j && j <= h){ 
				$("#tlIn").width(j * 182);
				$("#tlIn").append('\
					<span class="fragment"> \
					</span> <!--fragment-->');
				$('.fragment:eq(' + (j - 1) + ')').on('click', fragInfo);
				$.post('fragmentThumb', {index: j}, loadFrag);
				j++;
			}
			$('#tlIn').css({
				left: '-=' + 182
			});
			k++;
			i++;
		}
	});	
	$("#bw").on('click', function(){ 
		if (i > 1){
			$('#tlIn').css({
				left: '+=' + 182
			});
			k--;
			i--;
		}
	});
}

$(document).on('ready', inicio);
