define(function(){
	var tagInput = $('input[name="tags"]');
	var typeInput = $('input[name="type"]');
	var form = $('#filter');
	var currTags = []; //valor de tagInput
	var template = $('.project:first').html();
	var currResults = []; //títulos actualmente mostrados.

	var browse = {
		loadTag : function(){
			currResults = [];
			var delTypes = [];
			var self = this;
			var tags = $(tagInput).val().split(', ');
			var types = [];
			var len;
			//prevent duplicated and untagged
			len = tags.length;
			tags.sort();
			tags = $.grep(tags, function(val, index){
				return tags[index]=='' || tags.indexOf(val, index + 1) >= 0;
			}, true);
			currTags = tags;
			//obtener tipos a filtrar. y quitar resultados de tipos ya no solicitados
			len = $(typeInput).length;
			for(var i = 0; i < len; i++){ 
				if(typeInput[i].checked){
					types.push(typeInput[i].value);
				} else {
					$('.project:has(.type:contains("' + typeInput[i].value + '"))').remove();
				}
			}
			//quitar tags ya no solicitados. No hacer nada si no hay filtros
			len = tags.length;
			for(var i=1; i <= len; i++){ 
				$('.project.tags:not(:contains("' + tags[i-1] + '")), .project.detail:not(:has(.tags))').parents('.project').remove();
			}
			//evitar que la query nos regrese títulos duplicados
			len =  $('.project').length;
			for(var i = 0; i < len; i++){ 
				currResults.push($('.project:eq(' + i + ') .title').text());
			}
			$.post('/browse', {tags : tags, already : currResults, type: types, reload:true}, function(data){
				var add;
				//agregar resultados
				for(var i=0 in data){ 
					add = '<div class="project">' + self.template + '</div>';
					$('#results').prepend(add);
					add = $('.project:first');
					$(add).find('.title a').attr('href', '/project/' + data[i].title);
					$(add).find('.title a').on('click', Navigation.open);
					$(add).find('.title a').text(data[i].title);
					$(add).find('.thumb').attr('src', data[i].thumb);
					$(add).find('.detail.type').text(data[i].type);
					$(add).find('.detail').append('<span class="tags">'+data[i].tags+'</span>');
				}
			});
			return false;
		}
	}
	var self = browse;
	$(form).on('submit', self.loadTag);
	return browse;
});



