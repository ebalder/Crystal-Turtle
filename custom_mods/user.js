/*User module*/
module.exports = function(){
	function loadForm(req,res){
		res.render('userForm');
	}
	function openProfile (req, res){
		var user = req.params.user;
		db.query.string = "FOR u IN testU FILTER u.name == @user RETURN {'info' : u}";
		db.query.exec({'user': user})
		.then(
			function (ret){ 
				if(ret[0] == null){
					res.send('User not found.');
				}
				var owner = false;
				if(typeof(req.body.sid) != "undefined" && typeof(session[req.body.sid]) != "undefined" && ret[0].info.name == session[req.body.sid].user) {
					owner = true;
				}
				res.render('UserProfile',{
					usr : ret[0].info,
					owner : owner
				});
			},
			printError
		);
	}
	function submitNewUser(req,res){
		fs.readFile("user.json", 'utf8', function(err, data){
			data = JSON.parse(data);
			data._key = req.body.name;
			data.name = req.body.name;
			data.email = req.body.email;
			data.pass = req.body.pass;
			db.document.create("testU", data)
			.then(
				function(ret){
			  		var sid = Date.now() + new Date().getUTCMilliseconds();
			  		res.send({
			  			user : req.body.name,
			  			email : req.body.email,
			  			pass : req.body.pass,
			  			sid : "" + sid
			  		});
			  		console.log("new user registered: ", sid);
				},
				printError
			);
		});	
	}
	function updateProfile(req, res){
		db.document.get('testU/'+session[req.body.sid].user)
		.then(
			function(ret){ 
				if(session[req.body.sid] == undefined || session[req.body.sid].user != ret.name){
					res.send('Permission dennied.'); 
					return 0;
				}
				ret[req.body.field] = req.body.value;
				db.document.put(ret._id, ret)
				.then(
					function(){
						console.log('asdfa')
					},
					printError
				);
			},
			printError
		);
	}
	function printError(err){
		console.log("User error: " + err);
	}
	return {
		loadForm : loadForm,
		openProfile : openProfile,
		submitNewUser : submitNewUser,
		updateProfile : updateProfile
	};
}();

