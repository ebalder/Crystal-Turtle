/*Issues module*/
module.exports = function(){
	function loadNewIssue(req, res){
		res.render('newIssue');
	}
	function submitIssue(req, res){
		var project = req.headers['referer'].split("/")[4];
		db.document.get("test/"+project)
		.then(
			function(ret){
					if(session[req.body.sid] == undefined || ret.members.indexOf(session[req.body.sid].user) < 0){
						res.send('Permission dennied.'); 
						return 0;
					}
					var issue = {
						content : req.body.issue,
						date : new Date(),
						title : req.body.title,
						author : session[req.body.sid].user
					};
					console.log(issue.date);
					typeof(ret.issues) == "undefined"
						? ret.issues = [issue]
						: ret.issues.unshift(issue);
					db.document.put(ret._id, ret)
					.then(
						function(){
							res.send("ok");
						});
			},
			printError
		);
	}
	function printError(err){
		console.log("Issue error: " + err);
	}
	return{
		loadForm : loadNewIssue,
		submit	: submitIssue
	};
}();