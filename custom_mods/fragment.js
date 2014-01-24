/*Fragments management module*/
module.exports = function(){
	function loadNewForm(req,res){
		res.render('NewFragment');
	}
	function loadFragmentInfo(req, res){
		var project = req.headers['referer'].split('/')[4];
		var index = req.body.selection; 
		db.query.string = "FOR p IN test FILTER p._key == @project \
			RETURN { \
				'layers' : p.layers, \
				'fragment' : p.fragments[@index], \
				'members' : p.members \
			}";
	    db.query.exec({
	     	'project': project, 
	     	'index': index
	    })
	    .then( 
	    	function(ret){
				var dEntries = ret[0].fragment.entries != null ? ret[0].fragment.entries : [];
				var dLayers = ret[0].layers != null ? ret[0].layers : [] || [];
				var cLayers = [];
				var entries = {
					text : [],
					link : [],
					image : []
				};
				var found; 
				for (var i in dEntries){ //cada entrada
					entries[dEntries[i].type].push(dEntries[i]);
				}
				/*  Buscamos los layers con contenido de este fragmento */
				while (dLayers.length > 0){ //cada capa. 
					found = false;
					for (var i in dLayers[0].fragments){ //cada fragmento en la capa
						if(dLayers[0].fragments[i].index == index){
							cLayers.unshift(dLayers[0].name);
							dLayers.shift();
							found = true;
							break; 
						}
					}
					if (found == false){ //Si ya no hubo el timestamp en esa capa, deja de buscar en las demás
						break;
					}
				}
				var isMember = typeof(req.body.sid) != "undefined" 
					&& typeof(session[req.body.sid]) != "undefined" 
					&& ret[0].members.indexOf(session[req.body.sid].user) >= 0
					? true
					: false;
				ret[0].fragment.lines == null
					? ret[0].fragment.lines = []
					: null;
				res.render("FragmentInfo", {
					isMember : isMember,
					text : entries.text,
					image : entries.image,
					link : entries.link,
					eLayers : dLayers.reverse(), //empty layers
					cLayers : cLayers, //layers with contents
					annotation : ret[0].fragment.annotation,
					lines : ret[0].fragment.lines,
					timestamp : ret[0].fragment.timestamp,
					project : project
				});
			}, printError
		);
	}
	function getFragmentThumbs(req, res){
		var project = req.headers['referer'].split('/')[4];
		db.query.for('r').in('test')
	          .filter('r._key == @project')
	          .return("{'timestamps': r.fragments[*].timestamp}");
		db.query.exec({
			'project' : project}
		)
		.then(
			function(ret){ 
				var i = req.body.range[0];
				while(i <= req.body.range[1]){
					if (ret[0].timestamps[i] == null && i > 0){
						ret[0].timestamps[i] = ret[0].timestamps[i-1];
					} else if (i == 0){
						ret[0].timestamps[i] = "0";
					}
					i++;
				}
				res.send({
					timestamps : ret[0].timestamps.slice(req.body.range[0], req.body.range[1])
				});
			},
			printError
		);
	}
	function submitFragTs(req, res){
		var project = req.body.project;
		db.document.get('test/'+project)
		.then(
			function(ret){
				ret.fragments[req.body.fragment] == null
					? res.send("Fragment undefined")
					: null;
				ret.fragments[req.body.fragment].timestamp = req.body.ts;
				db.document.put(ret._id, ret);
				res.send("ok");
			},
			printError
		);
	}
	function printError(err){
		console.log("Fragment error: " + err);
	}
	return{
		loadForm : loadNewForm,
		getInfo : loadFragmentInfo,
		getThumbs : getFragmentThumbs,
		submitTimestamp : submitFragTs
	};
}();