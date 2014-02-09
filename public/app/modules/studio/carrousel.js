
define(function(require){
	var pinboard = require('studio/pinboard');

	var fps = 30;
	var lastFrame = 3000;
	var bodyWidth = $('body').width();
	var loaded = []; //fragmentos cargados
	var fragRange = [0,0];
	var cssBw = { left: '+=' + 182*3 };
	var cssFw = { left: '-=' +182*3 };
	var tlIn = document.getElementById('tlIn');
	var frIn = document.getElementById('frIn');
	var frames;
	var framRange = [0, 0];

	function _init(){ 
		$("#tlIn").css({"width" : '100%'});
		$("#frIn").css({"width" : 15 * range});

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
						self.loadFrags(index, index + Math.ceil(bodyWidth / 182));
						fragRange[0] = index;
						fragRange[1] = index + Math.ceil(bodyWidth / 182);
						scroll.push(index);
						return false;
					} 
				});
			}, 1000);
			return false;
		});
		/*======= Create frame list =======*/
		var range = Math.ceil(bodyWidth / 15 + 12);
		framRange[1] = range;
		for (var i = 0; i <= range; i++){
			var frame = document.createElement('div');
			frame.className = 'frame';
			frIn.appendChild(frame);
			frame.onclick = loadFrame;
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
				var data = {
					ts : $('.frame').index(ui.draggable) + framRange[0],
					project : project,
					fragment : $('.fragment').index(this)
				};
				$.post('/setFragTs', data);
			}
		});
		/* ======= Set events ======= */
		$("#timeline .fw").on('click', self.forward);
		$("#timeline .bw").on('click', self.backward);
		$("#frames .fw").on('click', self.fwFrame);
		$("#frames .bw").on('click', self.bwFrame);
		return 1;
	}

	function addClipThumb(clip){
		var thumb, img, timestamp;
		thumb = document.createElement('span');
		thumb.className = 'clip';
		img = document.createElement('span');
		img.className = 'thumb';
		timestamp = document.createElement('span');
		timestamp.className = 'timestamp';
		// timestamp.innerHTML = clip.timestamp.string;
		$(thumb).append(img, timestamp);
		$(tlIn).append(thumb);
		thumb.onclick = function(){clip.load();}
	}

	function loadFrame (ev) {
		var index = $('.frame').index(ev.currentTarget) + framRange[0];
		frames[index].load();
	}

	var carrousel = {
		addClipThumb : addClipThumb,
		backward : function(){  
			if (fragRange[0] > 0){
				$('#tlIn').animate(cssBw);
				fragRange[0]-=3;
				fragRange[1]-=3;
			}
			return 1;
		},
		bwFrame : function(){
			if( framRange[0] > 0){
				$('#frIn').css({"left" : -182});
				$('#frIn').animate({"left" : 0}, 200, 'swing');
				framRange[0] -= 12;
				framRange[0] -= 12;
			}
			return 1;
		},
		forward : function(){ 
			if (fragRange[1] < last){
				$('#tlIn').animate(cssFw);
				last - fragRange[1] < 0
					? loadFrags(fragRange[0]+1, fragRange[1]+1)
					: loadFrags(fragRange[0]+3, fragRange[1]+3);
			}
			return 1;
		},
		fwFrame : function(){
			if( framRange[1] < lastFrame){
				$('#frIn').animate({"left" : -182}, 200, 'swing', function(){
					$('#frIn').css({"left" : 0});
				});
				framRange[0] += 12;
				framRange[0] += 12;
			}
			return 1;
		},
		/* ToDo: put on a "project" module (load method) */
		loadFrags : function(start, end){
			var clip = new Clip(start, end);
			clips.push(clip);

			fragRange = [start, end];
			$.post('/fragmentThumbs', {range: fragRange}, function(data){
				var ts = data.timestamps;
				$.ajaxSetup({async:false});
				for (var i = 0 in ts){
					var time = self.parseTs(ts[i]);
					if(loaded.indexOf(fragRange[0]+i) < 0 && fragRange[1] <= last){
						$.get('storyboard/'+ i + '_' + time, function(data){
							self.fragImage(data, i, time);
						});
						$(".fragment:eq(" + i + ") .timestamp").html(time);
						loaded.push(fragRange[0]+i);
					}
				}
				$.ajaxSetup({async:true});
				return 1;
			});
		},
		fragImage : function(data, i, time){
			$(".fragment:eq(" + i + ") img").attr("src", data).css({
				'background-color' : '#F0F0F0'
			});
		},
		parseTs : function(obj){
			var index;
			if (typeof(obj) == "object"){
				index = $('.frame').index(obj) + framRange[0];
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
			var ts = hr + ":" + ("0" + min).slice(-2) + ":" +  ("0" + sec).slice(-2) + "." +  ("0" + fr).slice(-2);
			return ts;
		},
		setFrameArray : function(array){
			frames = array;
		}
	};
	var self = carrousel;
	_init();
	return carrousel;
});
