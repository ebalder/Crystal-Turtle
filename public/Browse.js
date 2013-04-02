function initArea(){
	var browse = new Browse($('input[name="tags"]'), $('input[name="type"]'), $('#filter'));
}

function Browse(tags, type, form){
	this.tagInput = tags;
	this.typeInput = type;
	this.form = form;
	this.currTags = []; //valor de tagInput
	this.template = $('.project:first').html();
	this.currResults = []; //títulos actualmente mostrados.
	$(this.form).on('submit', this.loadTag.bind(this));
}
Browse.prototype = {
	loadTag : function(){
		this.delTypes = [];
		this.currResults = [];
		var self = this;
		var tags = $(this.tagInput).val().split(' ');
		var types = [];
		var len;
		//evitar duplicados y vacíos
		len = tags.length;
		tags.sort();
		tags = $.grep(tags, function(val, index){
			return tags[index]=='' || tags.indexOf(val, index + 1) >= 0;
		}, true);
		this.currTags = tags;
		//obtener tipos a filtrar. y quitar resultados de tipos ya no solicitados
		len = $(this.typeInput).length;
		for(var i = 0; i < len; i++){ 
			if(this.typeInput[i].checked){
				types.push(this.typeInput[i].value);
			} else {
				$('.project:has(.type:contains("' + this.typeInput[i].value + '"))').remove();
			}
		}
		//quitar tags ya no solicitados. No hacer nada si no hay filtros
		len = tags.length;
		for(var i=1; i <= len; i++){ 
			$('.project .tags:not(:contains("' + tags[i-1] + '")), .project .detail:not(:has(.tags))').parents('.project').remove();
		}
		//evitar que la query nos regrese títulos duplicados
		len =  $('.project').length;
		for(var i = 0; i < len; i++){ 
			this.currResults.push($('.project:eq(' + i + ') .title').text());
		}
		$.post('/browse' + '/s', {tags : tags, already : this.currResults, type: types, reload:true}, function(data){
			var add;
			//agregar resultados
			for(var i=0 in data){ 
				add = '<div class="project">' + self.template + '</div>';
				$('#results').prepend(add);
				add = $('.project:first');
				$(add).find('.title a').attr('href', '../project/' + data[i].title);
				$(add).find('.title a').text(data[i].title);
				console.log($(add).filter('a'));
				$(add).find('.thumb').attr('src', data[i].thumb);
				$(add).find('.detail').text(data[i].type);
				$(add).find('.detail').append('<span class="tags">'+data[i].tags+'</span>');
			}
		});
		return false;
	}
}