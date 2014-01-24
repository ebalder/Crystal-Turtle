/*Project module*/
module.exports = function(){
	function loadProjectForm(req, res){
		res.render('projectForm');
	}
	function openInfoBoard(req, res){
		var project = req.params.project;
		db.query.string='FOR p IN test FILTER p._key == @project RETURN { \
			entries : p.fragments[*].entries \
		}';
		db.query.exec({project : project})
		.then(
			function(ret){
				var related = [];
				console.log()
				for(var i = 0 in ret[0].entries){
					for(var f = 0 in ret[0].entries[i]){
						if(req.body.related.indexOf(ret[0].entries[i][f].title) >= 0){
							related.push(ret[0].entries[i][f]);
						}
						if(ret[0].entries[i][f].title == req.body.base
							|| ret[0].entries[i][f].related.indexOf(req.body.base) >= 0){
							related.push(ret[0].entries[i][f]);
						}
					}
				}
				res.render('infoBoard', {
					project : project,
					entries : related
				});
			},
			printError
		);
	}
	function openProject(req, res){
		var project = req.params.project;
		db.document.get('test/'+project).
		then(
			function(ret){
				ret.stats.viewsWeek == null 
					? ret.stats.viewsWeek = 1 
					: ret.stats.viewsWeek += 1;
				db.document.put(ret._id, ret);
			},
			printError
		);
		db.query.string = "FOR p IN test FILTER p._key == @project RETURN{ \
			'members' : p.members, \
			'stats' : p.stats, \
			'issues' : p.issues, \
			'fragCount' : LENGTH(p.fragments) \
		}";
		db.query.exec({'project' : project}).
		then(
			function(ret){
				if(ret[0].stats == null){
					ret[0].stats = {}
				}
				var eval = [
					'viewsWeek',
					'viewsMonth',
					'viewsYear',
					'viewsEver',
					'activityWeek',
					'activityMonth',
					'activityYear'
				];
				for(var i = 0 in eval){
					isNaN(ret[0].stats[eval[i]]) ? ret[0].stats[eval[i]] = 0 : null;
				}
				var Vp = ret[0].stats.viewsWeek + ret[0].stats.viewsMonth + ret[0].stats.viewsYear + ret[0].stats.viewsEver;
				var Ap = ret[0].stats.activityWeek + ret[0].stats.activityMonth + ret[0].stats.activityYear;
				ret[0].stats.views = Vp;
				ret[0].stats.activity = Ap;
				var isMember = typeof(req.body.sid) != "undefined" 
					&& typeof(session[req.body.sid]) != "undefined" 
					&& ret[0].members.indexOf(session[req.body.sid].user) >= 0
					? true
					: false;
				projectMembers[project] = ret[0].members.slice(0);
				res.render('studio',{
					isMember : isMember,
					members : ret[0].members,
					stats : ret[0].stats,
					issues : ret[0].issues,
					project : project,
					fragCount : ret[0].fragCount - 1
				});
			}, 
			printError
		);
	}
	function submitProject(req, res){
		if(session[req.body.sid] == undefined ){
			res.send('Permission dennied.'); 
			return 0;
		}
		fs.readFile("project.json", 'utf8', function(err, data){
			data = JSON.parse(data);
			data._key = data.title = req.body.title;
			data.members = req.body.members.split(", ");
			data.members.push(req.body.user);
			delete req.body.sid;
			delete req.body.user;
			data.type = req.body.type;
			data.tags = req.body.tags.split(', ');
			data.start = new Date();
			db.document.create("test", data)
			.then(
				function(){ 
					for(var i = 0 in data.members){
						db.document.get("testU/" + data.members[i])
						.then(
								function(ret2){ 
									if (ret2.projects != null ){
										ret2.projects[data.title] = {
											ap : 0
										}
									} else { 
										ret2.projects = {};
										ret2.projects[data.title] = {
											ap : 0
										}
									}
										db.document.put(ret2._id, ret2);
										res.send("Project correctly submited");
								},
								printError
							);
					}
				},
				printError
			);
		});
	}
	function openLog(req, res){
		var project = req.params.project;
		db.query.string= "FOR p IN test FILTER p._key == @project RETURN{log : p.log}";
		db.query.exec({project : project})
		.then(
			function(ret){
				res.render("log.jade", {
					project : project,
					log : ret[0].log.reverse()
				});
			}
		);
	}
	function printError(err){
		console.log("Project error: " + err);
	}
	return{
		loadForm : loadProjectForm,
		openInfoBoard : openInfoBoard,
		open : 	openProject,
		submit : submitProject,
		openLog : openLog
	};
}();