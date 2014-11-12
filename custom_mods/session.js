/*Session module*/
module.exports = function(){
	function loadForm(req, res){
		res.render('login');
	}
	function login(req, res){
		db.query.string = "FOR u IN testU FILTER u.pass == @pass && ( u.name == @id || u.email == @id ) RETURN { \
				email : u.email, \
				name : u.name \
		 	}";
		db.query.exec({
			'pass' : req.body.pass,
			'id' : req.body.name
		}).then(
			function(ret){
				if (ret[0] == null){ 
					 res.send(false);
				}
				var sid = Date.now() + new Date().getUTCMilliseconds();
				var userInfo = {
					email : ret[0].email,
					user : ret[0].name,
					pass : ret[0].pass,
					sid : sid
				};
				session[sid] = userInfo;
				res.send(userInfo);
			},
			printError
		);
	}
	function logout(req, res){
		delete session[req.params.sid];
		res.send('Logged out.');
	}
	function printError(err){
		console.log("Session error: " + err);
	}
	return{
		loadForm : loadForm,
		login : login,
		logout : logout
	};
}();