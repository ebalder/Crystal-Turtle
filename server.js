
/* Dependencias */
var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
cons = require('consolidate'),
stylus = require('stylus'),
nib = require('nib'),
arango = require('arango.client');
fs = require('fs');
fs.mkdirp = require('mkdirp');

/* Servidor */
server.listen(3000);
console.log("running");

/* Usar nib en Stylus */
function compile(str, path) {
console.log("Parsing css");
return stylus(str).set('filename', path).use(nib());
}

/* Configuraciones de los módulos */
app.engine('.jade', cons.jade);
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(stylus.middleware({
   src: __dirname + '/Styl',
   dest: __dirname + '/public',
   compile: compile
 }));
app.use(express.static('./public')); //esto debe ir después de stylus

db = new arango.Connection;
db.use("test");


/* ALL */ //areas que pueden ser abiertas o recargadas con diferentes datos


/* GET */
app.get('/', openMain);
app.get('/browse', openMain);
app.get('/entryForm', loadEntryForm);
app.get('/newIssue', loadNewIssue);
app.get('/log/:project', openMain);
app.get('/login', loadLogin);
app.get('/newFragment',loadNewFragment);
app.get('/project/:project', openMain);
app.get('/projectForm', loadProjectForm);
app.get('/script/:project', openMain);
app.get('/user/:user', openMain)
app.get('/userForm', loadUserForm);

/* POST */
app.post('/browse', openBrowse);
app.post('/fragmentInfo', loadFragmentInfo);
app.post('/fragmentThumbs', getFragmentThumbs);
app.post('/infoBoard/:project', openInfoBoard);
app.post('/InfoTag/:project', loadInfoTagSearch);
app.post('/layer/:project/:layer', loadLayer);
app.post('/log/:project', openLog);
app.post('/login', doLogin);
app.post('/logout', doLogout);
app.post('/project/:project', openProject);
app.post('/saveCanvas', submitCanvas);
app.post('/saveImage', submitImage);
app.post('/script/:project', openScript);
app.post('/setFragTs', submitFragTs)
app.post('/submitEntry', submitEntry);
app.post('/submitIssue', submitIssue);
app.post('/submitProfileData', submitProfileData);
app.post('/submitProject', submitProject);
app.post('/submitScript', submitScript);
app.post('/submitUser', submitNewUser);
app.post('/user/:user', openUserProfile)

var session = [];
var peerMembers = [];
var projectMembers = [];

/* SOCKETS */
io.sockets.on('connection', function (socket) {
	socket.on('join', function (data, res) {
		if(projectMembers[data.project].indexOf(session[data.sid].user) >= 0){
			socket.sid = data.sid;
			if(typeof(peerMembers[data.project]) == 'undefined'){
				peerMembers[data.project] = [socket];
			}
			else if(peerMembers[data.project].indexOf(data.sid) < 0){
				peerMembers[data.project].push(socket);
			}
			var peers = [];
			var len = peerMembers[data.project].length;
			for(i = 0; i < len; i++){
				if(peerMembers[data.project][i].sid != data.sid){
					peers.push(peerMembers[data.project][i].sid);
					//peerMembers[data.project][i].emit('newPeer', {sid : data.sid});
				}
			}
			res(peers);
		}
	});
});

fs.exists('sessions', function(exists){
	if (!exists) {
		session = {};
	} else {
		fs.readFile("sessions", 'utf8', function(err, data){
			data = JSON.parse(data);
			session = data;
		});
	}
});
process.on("SIGINT", function() {
  	console.log("exiting...");
    fs.exists('sessions', function(exists){
		if (exists) {
			session = JSON.stringify(session, null, 4);
			fs.writeFileSync('sessions', session, encoding='utf8');
		} 
    	process.exit();
	});
});
process.once('SIGUSR2', function () {
  	console.log("exiting...");
    fs.exists('sessions', function(exists){
		if (exists) {
			session = JSON.stringify(session, null, 4);
			fs.writeFileSync('sessions', session, encoding='utf8');
		}
		process.kill(process.pid, 'SIGUSR2'); 
	});
});


/* Functions */

function doLogin(req, res){
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
				 res.send('Wrong username or password.');
				 console.log("Wrong username or passowrd.")
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
function doLogout(req, res){
	delete session[req.params.sid];
	res.send('Logged out.');
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
function loadEntryForm(req, res){
	res.render('EntryForm');
}
function loadLogin(req, res){
	res.render('Login');
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
						console.log("aeiou");
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
function loadLayer(req, res){
	res.render("Canvas");
}
function loadNewFragment(req,res){
	res.render('NewFragment');
}
function loadNewIssue(req, res){
	res.render('NewIssue');
}
function loadProjectForm(req, res){
	res.render('ProjectForm');
}
function loadUserForm(req,res){
	res.render('UserForm');
}
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
			res.render('InfoBoard', {
				project : project,
				entries : related
			});
		},
		printError
	);
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
function openMain(req,res){
	res.render('Main');
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
			res.render('Proyecto',{
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
function openUserProfile(req, res){
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
		  		res.send("User '" + name + "' successfully registered.");
			},
			printError
		);
	});
	
}
function submitProfileData(req, res){
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
function submitProject(req, res){
	if(session[req.body.sid] == undefined ){
		res.send('Permission dennied.'); 
		return 0
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
	console.log(err);
}




