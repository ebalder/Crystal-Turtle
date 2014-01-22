define(['studio/carrousel',  'studio/canvas'], function(carrousel, canvas){
	/* ToDo: make a studioUtil module with a parseTs method */
	var timestamp = null;
	var index = null;
	var layer = null;
	var layern = null;

	var pinboard = {
		board : function(ev){
			var project = window.location.pathname.split( '/' )[1];
			var group = {
				related : $(ev.target).parents('.entry').find('.related a').text().split(', '),
				base : $(ev.target).parents('.entry').find('a.group').text()
			};
			$.post('/infoBoard/' + project, group, function(data){
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
			$(".group").on('click', self.board);
			return false;
		},
		fragInfo : function(ev){
			this.timestamp = $(ev.currentTarget).find('.timestamp').text();
			this.index = $('.fragment').index(ev.currentTarget);
			var json = {
				selection: this.index,
				sid : sessionStorage.sid
			};
			$.post('/fragmentInfo', json, self.showData);	
		},
		frame : function(ev){
			carrousel.parseTs(ev.target);
		},
		showData : function(data){
			console.log('showData');
			$('#fragmentInfo').empty();
			var imgindex;
			$("#fragmentInfo").html(data); 
			$(".new").on('click', self.newEntry);
			$(".layer a").on('click', self.fragLayer);
			$.each($('#fragmentInfo img'), function(index, value){
				imgindex = index;
				$.get($(value).attr('src'), function(data){ 
					$('#img img:eq(' + imgindex + ')').attr('src', data);
				});
			});
			$(".group").on('click', self.board);
		},
		fragLayer : function(ev){
			var n = $(ev.target).attr("n");
			this.layer = ev.target.href.split('/')[5];
			this.layern = $("#layers .layer a").length - $("#layers .layer a").index(ev.target) - 1;
			$.post(ev.target.href,{name : n, timestamp : timestamp, fragment : index}, function(data){ 
				$('#loaded').html(data);
				canvas.openLayer(); 
			});
			return false;
		},
		newEntry : function(){
			var img64 = '';
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
	};
	var self = pinboard;
	return pinboard;
});