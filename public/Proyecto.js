
var viewer;
var panel;
var carrousel;

function initArea(){ 
	viewer = new Viewer();
	panel = new Panel();
	carrousel = new Carrousel();
}

function Carrousel(){
	this.bodyWidth = $('body').width();
	this.total = 12; //Fragmentos disponibles /-quitar
	this.loaded = 0; //mayor cargado
	this.i = 0; //Menor visible
	this.j = 0; //Mayor visible
	this.cssBw = { left: '+=' + 182 };
	this.cssFw = { left: '-=' +182 };
	this.init();
}
Carrousel.prototype = {
	backward : function(){  
		if (this.i >= 0){
			$('#tlIn').css(this.cssBw);
			this.j--;
			this.i--;
		}
	},
	forward : function(){ 
		if(this.j <= this.total){ 
			if (this.j == this.loaded){ 
				$("#tlIn").width(this.j * 182);
				$("#tlIn").append('\
					<span class="fragment"> \
					</span> <!--fragment-->'); 
				$('.fragment:eq(' + (this.loaded) + ')').on('click', viewer.fragInfo.bind(viewer));
				$.post('../fragmentThumb' + '/s', {index: this.loaded}, this.loadFrag.bind(this));
				this.loaded++;
			} 
			$('#tlIn').css(this.cssFw); 
			this.j++;
			this.i++;
		}
	},
	init : function(){ 
		while ((this.bodyWidth / ((180+2) * this.i + 1) >= 1) && this.loaded <= this.total) { 
			$("#tlIn").append('\
				<span class="fragment"> \
				</span> <!--fragment-->');
			$.post('../fragmentThumb' + '/s', {index:this.loaded}, this.loadFrag.bind(this));
			this.i++;
			this.loaded++;
		}
		this.i = 0;
		this.j = this.loaded;
		$('.fragment').on('click', viewer.fragInfo.bind(viewer));
		$("#fw").on('click', this.forward.bind(this));
		$("#bw").on('click', this.backward.bind(this));
	},
	loadFrag : function(data){
		var time = data.timestamp;
		var thumb = Number(data.index) ; // /-quitar, los thumbs tendrán el mismo nombre del timestamp
		$("#tlIn > .fragment:eq(" + thumb +")").html('\
			<span class="thumb">\
				<img src ="../Frames/' + (thumb+1) + '.jpg">\
			</span><!--thumb-->\
			<span class="timestamp">' + time + '</span><!--timestamp-->');
	}
}

function Panel(){
	this.timestamp = "dfaf";
	this.cssShow = {'left' : '0'};
	this.cssHide = {'left' : '-27%'};
	$('#panel').on('click', stopPropagation); //click al panel no lo oculta
	this.hide(this);
}
Panel.prototype = {
	hide : function (){ 
		$('body').off('click', this.triggerHide);
		$('#panel').css(this.cssHide);
		$('#panTab').one('click', this.show.bind(this));
	},
	show : function(){
		this.timestamp = viewer.timestamp;
		$('#panel').css(this.cssShow); 
		$('body').one('click', this.triggerHide);
		$('#panTab').one('click', this.hide.bind(this));
	},
	triggerHide : function(){
		$("#panTab").trigger('click');
	}
}

function Viewer(){ 
	this.timestamp = null;
	this.index = null;
	this.layer = null;
}
Viewer.prototype = {
	fragInfo : function(ev){
		this.index = $('.fragment').index(ev.currentTarget);
		this.timestamp = $(ev.currentTarget).find('.timestamp').text();
		$.post('../fragmentInfo' + '/s', {selection: this.index}, this.showData.bind(this));	
	},
	showData : function(data){
		$('#fragmentInfo').empty();
		var imgindex;
		$("#fragmentInfo").html(data); 
		$(".new").on('click', this.newEntry.bind(this));
		$(".layer a").on('click', this.fragLayer.bind(this));
		$.each($('#fragmentInfo img'), function(index, value){
			imgindex = index;
			$.get($(value).attr('src') + '/s', function(data){ 
				$('#img img:eq(' + imgindex + ')').attr('src', data);
			});
		});
	},
	fragLayer : function(ev){
		var n = $(ev.target).attr("n");
		this.layer = ev.target.href.split('/')[5];
		$.post(ev.target.href + '/s',{name : n, timestamp : this.timestamp, fragment : this.index}, function(data){ 
			$('#loaded').html(data);
			inicioCanvas(); //falta acción para eliminar el script, quizà haciendo el canvas otro objeto
		});
		return false;
	},
	newEntry : function(){
		var timestamp = this.timestamp;
		var img64 = '';
		var index = this.index;
		$.get("../entryForm" + '/s', function(data){ 
			$('#contents').html(data);
			$('input[name="timestamp"]').val(timestamp);
			$('#entryForm').on('submit', function(ev){
				$.post("../submitEntry" + "/s", $('#entryForm').serialize() + '&fragment=' + index +'&sid=' + sessionStorage.sid , function(){
					$('.msg').html("Submission complete");
				});
				if($('select[name="type"]').val() == 'image'){
					var submit = {
						dir : window.location.pathname.split( '/' )[2],
						name : $('input[name="title"]').val(),
						image : img64
					}
					$.post("../saveImage" + '/s', submit, function(){
						$('.msg').html("ok");
					})
				}
				return false;
			});
			$('select[name="type"]').on('change', function(){
				switch ($('select[name="type"]').val()){
					case 'text':
						$('#entryForm [name="content"]').replaceWith('<textarea name="content" cols="30" rows="20"/>');
						break;
					case 'link': 
						$('#entryForm [name="content"]').replaceWith('<input type="text" name="content"/>');
						break;
					case 'image':
						$('#entryForm [name="content"]').replaceWith('<input type="file" name="content"/>');
						$('input[name="content"]').on('change', function(ev){
							var reader = new FileReader();
							$(reader).on('load', function(){
								img64 = reader.result;
							});
							reader.readAsDataURL(ev.target.files[0]);
						});
						break
				}
			});
		});
		return false;
	}
}

