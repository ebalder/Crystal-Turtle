/*canvas module*/
module.exports = function(){
	function loadLayer(req, res){
		res.render("Canvas");
	}
		function submitCanvas(req, res){
		fragment = {
			planes : req.body.planes.length
		};
		db.document.get('test/'+req.body.project)
		.then(
			function(ret){ 
				if(session[req.body.sid] == undefined || ret.members.indexOf(session[req.body.sid].user) < 0){
					res.send('Permission dennied.'); 
					return 0
				}
				ret.layers[req.body.layern].fragments[req.body.fragment] = fragment;
				ret.stats.activityWeek == null 
					? ret.stats.activityWeek = 3
					: ret.stats.activityWeek += 3;
				var log = {
					date : new Date(),
					user : session[req.body.sid].user + " / " + session[req.body.sid].email,
					details : req.body.layer + " " 
						+ "added at fragment " + req.body.fragment + " [" + req.body.timestamp + "]",
					action : "Layer content"
				};
				ret.log.push(log);
				db.document.put(ret._id, ret)
				db.document.get("testU/"+session[req.body.sid].user)
				.then(
					function(ret){
						ret.projects[req.body.project].ap += 3;
						db.document.put(ret._id, ret);
					}
				);
			},
			printError
		);
		for (var i in req.body.planes){
			fs.exists('public/' + req.body.project + '/' + req.body.layer + '/' 
				+ req.body.fragment + '_' + req.body.timestamp, 
				function(exists){
				if(!exists){ 
					fs.mkdirp('public/project/' + req.body.project + '/' + req.body.layer,
						function(){
							fs.writeFile('public/project/' + req.body.project + '/' + req.body.layer + '/' + req.body.fragment + '_' + req.body.timestamp, req.body.planes[i], encoding='utf8');
						});
				}
			});
		}
	}
	function printError(err){
		console.log("Canvas/layer error: " + err);
	}
	return{
		loadLayer : loadLayer,
		submitCanvas : submitCanvas
	}
}();