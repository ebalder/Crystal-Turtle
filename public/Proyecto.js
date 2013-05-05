
var viewer;
var panel;
var carrousel;
var project = window.location.pathname.split( '/' )[2];

function initArea(){ 
	viewer = new Viewer();
	panel = new Panel();
	carrousel = new Carrousel();
	return 0;
}

function Carrousel(){
	this.fps = 30;
	this.last = 100;
	this.lastFrame = 3000;
	this.bodyWidth = $('body').width();
	this.loaded = []; //fragmentos cargados
	this.fragRange = [0,0];
	this.framRange = [0,0];
	this.cssBw = { left: '+=' + 182*3 };
	this.cssFw = { left: '-=' +182*3 };
	this.init();
	return 1;
}
Carrousel.prototype = {
	backward : function(){  
		if (this.fragRange[0] > 0){
			$('#tlIn').animate(this.cssBw);
			this.fragRange[0]-=3;
			this.fragRange[1]-=3;
		}
		return 1;
	},
	bwFrame : function(){
		if( this.framRange[0] > 0){
			$('#frIn').css({"left" : -182});
			$('#frIn').animate({"left" : 0}, 200, 'swing');
			this.framRange[0] -= 12;
			this.framRange[0] -= 12;
		}
	},
	forward : function(){ 
		if (this.fragRange[1] < this.last){
			$('#tlIn').animate(this.cssFw);
			this.loadFrags(this.fragRange[0]+3, this.fragRange[1]+3);
		}
		return 1;
	},
	fwFrame : function(){
		if( this.framRange[1] < this.lastFrame){
			$('#frIn').animate({"left" : -182}, 200, 'swing', function(){
				$('#frIn').css({"left" : 0});
			});
			this.framRange[0] += 12;
			this.framRange[0] += 12;
		}
		return 1;
	},
	init : function(){ 
		var self = this;
		/*======== Create fragment list =====*/
		for (var i = 0; i <= this.last; i++){
			$("#tlIn").append('\
				<span class="fragment"> \
					<span class="thumb">\
						<img /> \
					</span><!--thumb-->\
					<span class="timestamp"> \
					</span><!--timestamp--> \
				</span> <!--fragment--> \
			');
		}
		$("#tlIn").css({"width" : 182 * this.last});
		/*======= Load visible fragments ======*/
		this.loadFrags(0, Math.ceil(this.bodyWidth / 182));
		/*====== Set scrollbar actions =====*/
		var scrollTop = $('#tlView').scrollTop();
		var width = $('#tlView').width();	
		var scroll = [0];
		$("#tlView").on('scroll', function(){
			setTimeout(function(){ //reduce precision for easier handling
				$(".fragment").each(function(index, val){
					var offset = $(this).offset();
					if (scroll.indexOf(index) < 0 && scrollTop <= offset.left
						&& $(this).width() + offset.left < scrollTop + width){
						self.loadFrags(index, index + Math.ceil(self.bodyWidth / 182));
						scroll.push(index);
						return false;
					} 
				});
			}, 500);
			return false;
		});
		/*======= Create frame list =======*/
		var range = Math.ceil(this.bodyWidth / 15 + 12);
		this.framRange[1] = range;
		$("#frIn").css({"width" : 15 * range})
		for (var i = 0; i <= range; i++){
			$("#frIn").append('<div class="frame"></div>');
		}
		/* ====== Drag drop ====== */
		$('.frame').draggable({
			revert : true,
			stack : ".frame, .fragment" 
		});
		$('.fragment').droppable({
			drop : function(ev, ui){
				var ts = self.parseTs(ui.draggable);
				$(this).find('.timestamp').html(ts);
				console.log($('.frame').index(ui.draggable) + self.framRange[0]);
				var data = {
					ts : $('.frame').index(ui.draggable) + self.framRange[0],
					project : project,
					fragment : $('.fragment').index(this)
				};
				$.post('/setFragTs', data);
			}
		});
		/* ======= Set events ======= */
		$('.frame').on('click', viewer.frame.bind(viewer));
		$('.fragment').on('click', viewer.fragInfo.bind(viewer));
		$("#timeline .fw").on('click', this.forward.bind(this));
		$("#timeline .bw").on('click', this.backward.bind(this));
		$("#frames .fw").on('click', this.fwFrame.bind(this));
		$("#frames .bw").on('click', this.bwFrame.bind(this));
		$('.timestamp').on('click', function(ev){
			console.log(ev.target, "asdf");
		});
		return 1;
	},
	loadFrags : function(start, end){
		var self = this;
		this.fragRange = [start, end];
		$.post('/fragmentThumbs', {range: this.fragRange}, function(data){
			var ts = data.timestamps;
			for (var i = 0 in ts){
				var num = Number(i) + 1;
				if(self.loaded.indexOf(self.fragRange[0]+i) < 0){
					$(".fragment:eq(" + i + ") img").attr("src", 'fragments/' + num + '.jpg');
					$(".fragment:eq(" + i + ") .timestamp").html(self.parseTs(ts[i]));
					self.loaded.push(self.fragRange[0]+i);
				}
			}
			return 1;
		});
	},
	parseTs : function(obj){
		var index;
		console.log(typeof(obj));
		if (typeof(obj) == "object"){
			index = $('.frame').index(obj) + carrousel.framRange[0];
		} else if(typeof(obj) == "Number" || typeof(obj) == "string"){
			index = Number(obj);
		}
		var aux = index;
		var hr = Math.floor(aux / (30*60*60));
		aux -= hr * (30*60*60);
		var min = Math.floor(aux / (30*60));
		aux -= min * (30*60);
		var sec = Math.floor(aux / (30));
		aux -= sec * (30);
		var fr = aux;
		var ts = hr + ":" + min + ":" + sec + "." + fr;
		return ts;
	}
}

function Panel(){
	this.timestamp = "dfaf";
	this.cssShow = {'left' : '0'};
	this.cssHide = {'left' : '-27%'};
	$('#panel').on('click', stopPropagation); //click al panel no lo oculta
	this.hide(this);
	return 1;
}
Panel.prototype = {
	hide : function (){ 
		$('body').off('click', this.triggerHide);
		$('#panel').css(this.cssHide);
		$('#panTab').one('click', this.show.bind(this));
		return 1;
	},
	show : function(){
		this.timestamp = viewer.timestamp;
		$('#panel').css(this.cssShow); 
		$('body').one('click', this.triggerHide);
		$('#panTab').one('click', this.hide.bind(this));
		return 1;
	},
	triggerHide : function(){
		$("#panTab").trigger('click');
		return 1;
	}
}

function Viewer(){ 
	this.timestamp = null;
	this.index = null;
	this.layer = null;
	this.layern = null;
}
Viewer.prototype = {
	board : function(ev){
		var project = window.location.pathname.split( '/' )[2];
		var group = {
			related : $(ev.target).parents('.entry').find('.related a').text().split(' '),
			base : $(ev.target).parents('.entry').find('a.group').text()
		};
		$.post('/InfoBoard/' + project, group, function(data){
			$('#area').after('<div id="area2">' + data + '</div>');
			$('#area').hide();
			$.each($('.entry img'), function(index, value){
				imgindex = index;
				$.get($(value).attr('src'), function(data){ 
					$('.entry img:eq(' + imgindex + ')').attr('src', data);
				});
			});
		});
		$('#area2 .back, :not(#area2 a)').on('click', function(){
			$('#area2').remove();
			$('#area').show();
		});
		$(".group").on('click', this.board);
		return false;
	},
	fragInfo : function(ev){
		this.timestamp = $(ev.currentTarget).find('.timestamp').text();
		this.index = $('.fragment').index(ev.currentTarget);
		$.post('/fragmentInfo', {selection: this.index}, this.showData.bind(this));	
	},
	frame : function(ev){
		carrousel.parseTs(ev.target);
	},
	showData : function(data){
		$('#fragmentInfo').empty();
		var imgindex;
		$("#fragmentInfo").html(data); 
		$(".new").on('click', this.newEntry.bind(this));
		$(".layer a").on('click', this.fragLayer.bind(this));
		$.each($('#fragmentInfo img'), function(index, value){
			imgindex = index;
			$.get($(value).attr('src'), function(data){ 
				$('#img img:eq(' + imgindex + ')').attr('src', data);
			});
		});
		$(".group").on('click', this.board);
	},
	fragLayer : function(ev){
		var n = $(ev.target).attr("n");
		this.layer = ev.target.href.split('/')[5];
		this.layern = $("#layers .layer a").length - $("#layers .layer a").index(ev.target) - 1;
		$.post(ev.target.href,{name : n, timestamp : this.timestamp, fragment : this.index}, function(data){ 
			$('#loaded').html(data);
			inicioCanvas(); //falta acción para eliminar el script, quizà haciendo el canvas otro objeto
		});
		return false;
	},
	newEntry : function(){
		var timestamp = this.timestamp;
		var img64 = '';
		var index = this.index;
		$.get("/entryForm", function(data){ 
			$('#contents').html(data);
			$('input[name="timestamp"]').val(timestamp);
			$('#entryForm').on('submit', function(ev){
				$.post("/submitEntry", $('#entryForm').serialize() + '&fragment=' + index +'&sid=' + sessionStorage.sid , function(){
					$('.msg').html("Submission complete");
				});
				if($('select[name="type"]').val() == 'image'){
					var submit = {
						dir : 'project/'+window.location.pathname.split( '/' )[2],
						name : $('input[name="title"]').val(),
						image : img64,
						type : "b64"
					};
					$.post("/saveImage", submit, function(){
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

