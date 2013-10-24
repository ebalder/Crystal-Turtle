/*Entry module*/
module.exports = function(){
	function loadEntryForm(req, res){
		res.render('EntryForm');
	}
	function submitEntry(req, res){
		var project = req.headers['referer'].split("/")[4];
		db.document.get('test/'+project)
		.then(
			function(ret){ 
				if(session[req.body.sid] == undefined || ret.members.indexOf(session[req.body.sid].user) < 0){
					res.send('Permission dennied.'); 
					return 0
				}
				var log = {
					date : new Date(),
					user : session[req.body.sid].user + " / " + session[req.body.sid].email,
					details : req.body.type + " entry added at fragment " + req.body.fragment + " [" + req.body.timestamp + "]",
					action : "New fragment info"
				};
				ret.log.push(log);
				ret.stats.activityWeek == null 
					? ret.stats.activityWeek = 1
					: ret.stats.activityWeek += 1;
				req.body.related = req.body.related.split(", ");
				req.body.tags = req.body.tags.split(", ");
				var index = req.body.fragment;
				delete req.body.fragment;
				ret.fragments[index].entries.push(req.body);
				db.document.put(ret._id, ret);
				db.document.get("testU/"+session[req.body.sid].user)
				.then(
					function(ret){
						ret.projects[project].ap += 1;
						db.document.put(ret._id, ret);
					}
				);
			},
			printError
		);
	}
	function submitImage(req, res){
		fs.exists('public/'+req.body.dir, function(exists){
			var ext;
			var encode;
			switch (req.body.type){
				case "b64" : 
					ext = "";
					encode = 'utf8';
					break;
				case "png" :
				case "jpeg" :
				case "jpg" : 
					ext = ".jpg";
					encode = 'binary'
					break;
			}
			console.log("asdf", req.body.type, encode, ext);
			if(typeof(req.body.upload) != "undefined"){
				req.body.image = fs.readFileSync(req.files.qqfile.path, encoding = encode);
			}
			if (!exists) {
				fs.mkdirp('public/'+req.body.dir, function(){
					fs.writeFile('public/'+req.body.dir+'/'+req.body.name+ext, req.body.image, encoding=encode, function(){
					res.send({success:true});
					});
				});
			} else {
				fs.writeFile('public/'+req.body.dir+'/'+req.body.name+ext, req.body.image, encoding=encode, function(){
					res.send({success:true});
				});
			}
		});
	}
	function printError(err){
		console.log("Entry error: " + err);
	}
	return{
		loadForm : loadEntryForm,
		submit : submitEntry,
		submitImage : submitImage
	};
}();