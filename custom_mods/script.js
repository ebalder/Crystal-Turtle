/*Script module*/
module.exports = function(){
	function openScript(req, res){
		var project = req.params.project;
		db.query.string = "For s IN test Filter s.project == @project RETURN {'script' : s.script}";
		db.query.exec({'project' : project})
		.then(
			function (ret){
				res.render("Script", {
					content : ret,
					project : project
				});
			},
			printError
		);
		res.render("Script", {
			content : '',
			project : project
		});
	}
	function submitScript(req, res){
		var project = req.headers['referer'].split("/")[4];
		var appends = {
			entries : [],
			timestamp : null
		};
		if (req.body.flag == '2'){
			fragments = req.body;
			fragments.entries = [];
			fragments.timestamp = null;
		} else {
			fragments = req.body.fragments;
			for (var i in fragments){
				fragments[i].entries=[];
				fragments[i].timestamp = null;
			}
		}
		db.document.get('test/'+project)
		.then( 
			function(ret){ 
				if(session[req.body.sid] == undefined || ret.members.indexOf(session[req.body.sid].user) < 0){
					res.send('Permission dennied.'); 
					return 0
				}
				var details;
				if (req.body.flag == '2'){
					details = fragments.annotation;
					delete req.body.flag;
					ret.fragments.push(fragments);
					ret.stats.activityWeek == null 
						? ret.stats.activityWeek = 1
						: ret.stats.activityWeek += 1;
				}else{
					details = "Script rewrite.";
					ret.fragments = req.body.fragments;
					ret.stats.activityWeek == null 
						? ret.stats.activityWeek = req.body.fragments.length
						: ret.stats.activityWeek += req.body.fragments.length;
				}
				var log = {
					date : new Date(),
					user : session[req.body.sid].email + " / " + session[req.body.sid].email,
					details : details,
					action : "Script"
				};
				ret.log.push(log);
				db.document.put(ret._id, ret);
				db.document.get("testU/"+session[req.body.sid].user)
				.then(
					function(ret){
						ret.projects[project].ap += details ==  "Script rewrite."
							? req.body.fragments.length
							: 1;
						db.document.put(ret._id, ret);
					}
				);
				res.send("ok");
			},
			printError
		);
	}
	function printError(err){
		console.log("Script error: " + err);
	}
	return{
		open : openScript,
		submit : submitScript
	};
}();