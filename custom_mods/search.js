/*Search (Browse) module
Para buscar un proyecto o buscar recursos en un proyecto.*/
module.exports = function(){
	function openBrowse(req, res){
		var filter = '';
		req.body.already != null || req.body.type != null || req.body.tags != null ? filter = 'FILTER ' : null;
		if(req.body.already != null){
			for(var i=0 in req.body.already){
				filter += 'p._key != "' + req.body.already[i] + '" &&';
			}
			filter = filter.substr(0, filter.length -2);
			if(req.body.type != null || req.body.tags != null){
				filter += ' && ';
			}
		}
		if (req.body.type != null){
			filter += '(';
			for(var i=0 in req.body.type){
				filter += 'p.type == "' + req.body.type[i] + '" || ';
			}
			filter = filter.substr(0, filter.length -3);
			filter += ')';
		}
		if (req.body.tags != null){
			if(req.body.already != null || req.body.type != null){
				filter += ' && ';
			}
			filter += '('
			for(var i=0 in req.body.tags){
				filter += 'like(to_string(p.tags), "%' + req.body.tags[i] + '%", true) || ';
			}
			filter = filter.substr(0, filter.length -3);
			filter += ') ';
		}
		db.query.string = "FOR p IN test " + filter + " RETURN {'type' : p.type, 'title' : p.title, 'thumb' : p.thumb, tags : p.tags}";
		db.query.exec().then(
			function(ret){
				req.body.tags == null ? req.body.tags = [] : null;
				for(var i=0; i < ret.length; i++){
					for(var j=0; j < req.body.tags; j++){ 
						if(ret[i].tags == null || ret[i].tags.indexOf(req.body.tags[j]) == -1){ 
							ret.splice(i,1);
							i--;
						}
					}
				}
				if(req.body.reload == null){
					res.render('Browse', {
						projects : ret
					});
				} else { 
					res.send(ret);
				}
			},
			printError
		);
	}
	function loadInfoTagSearch (req, res){
		///***** quitar lo que sobre ****/////
		var project = req.params.project;
			db.query.string='FOR p IN test FILTER p._key == @project RETURN { \
				entries : p.fragments[*].entries \
			}';
			var tags = [];
			var related = [];
			db.query.exec({project : project})
			.then(
				function(ret){
					for(var i = 0 in ret[0].entries){
						for(var f = 0 in ret[0].entries[i]){
							for(var j = 0 in req.body.related){
								if(ret[0].entries[i][f].title == req.body.related[j]){
									related.push(ret[0].entries[i][f]);
									continue;
								}
								for (var h = 0 in req.body.tags){
									if(ret[0].entries[i][f].tags.indexOf(req.body.tags[h]) >= 0){
										tags.push(ret[0].entries[i][f]);
										break;
									}
								}
							}
						}
					}
				},
				printError
		);
	}
	function printError(err){
		console.log("Search error: " + err);
	}
	return{
		openBrowse : openBrowse,
		loadInfoTagSearch : loadInfoTagSearch
	};	
}();