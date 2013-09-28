
define(['studio/viewer'], function(viewer){
	var timestamp = "0:00:00.00";
	var cssShow = {'left' : '0'};
	var cssHide = {'left' : '-27%'};
	$('#panel').on('click', stopPropagation); //click al panel no lo oculta
	var hide;
	var image;
	var dir;
	var name;
	var timestamp;
	var fragment = 0;
	var layer;
	var params;
	var images = [];
	$('#fileUploader').fineUploader({
		request : {
			method : "POST",
			forceMultipart: false,
			endpoint : "/saveImage",
			paramsInBody : true
		},
		autoUpload : false,
		text : {
			 uploadButton: '<i class="icon-plus icon-white"></i> Select Files',
			 retry : 'Retry'
		},
		validation: {
			allowedExtensions: ['jpeg', 'jpg', 'png'],
			sizeLimit: 1024 * 700
		},
		resume : {
			enabled : true
		}
	})
	.on('upload', function(ev, id, file){
		fragment = carrousel.last;
		var type = file.split('.');
		type =  type[type.length-1];
		for (var i = 0; i <= carrousel.last; i++){
			if($('.fragment:eq('+i+') .timestamp').text() > timestamp){
				fragment = i-1;
				break;
			}
		}
		name = fragment + '_' + timestamp;
		params = {
			dir : dir,
			name : name,
			upload : "multiple",
			type : type
		};
		$('#fileUploader').fineUploader('setParams', params);
		timestamp = self.plusOne(timestamp);
		return false;
		$.post('/submitImage', params, function(){
			console.log("ok");
		});
		console.log("posted");
	})
	.on('cancel', function(){
		console.log("cancelled");
	});
	$('#multiple').on('submit', function(){
		timestamp = $('input[name="from"]').val();
		timestamp == "" ? timestamp = "0:00:00.00" : null;
		layer = $('input[name="layer"]').val();
		dir = 'project/' + project + '/' + layer;
		$('#fileUploader').fineUploader('uploadStoredFiles');
		return false;
	});

	var pinboard = {
		hide : function (){ 
			$('body').off('click', self.triggerHide);
			$('#panel').css(self.cssHide);
			$('#panTab').one('click', self.show);
			return 1;
		},
		show : function(){
			timestamp = viewer.timestamp;
			$('#panel').css(self.cssShow); 
			$('body').one('click', self.triggerHide);
			$('#panTab').one('click', self.hide;
			return 1;
		},
		submit : function(ev){
			console.log(ev.target.files);
		},
		triggerHide : function(){
			$("#panTab").trigger('click');
			return 1;
		},
		plusOne : function(timestamp){
			var aux = timestamp.split(':');
			var aux2 = aux[2].split('.');
			aux[2] = aux2[0];
			aux[3] = aux2[1];
			if (aux[3] == 29){
				if(aux[2] == 59){
					if(aux[1] == 59){
						if(aux[0] == 9){
							return false;
						} else {
							aux[0]++;
						}
					} else {
						aux[1]++;
					}
				} else {
					aux[2]++;
				}
			} else {
				aux[3]++;
			}
			return aux[0] + ":" + aux[1] + ":" + aux[2] + "." + aux[3];
		}
	};
	var self = pinboard;
	return pinboard;
});