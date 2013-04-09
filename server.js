
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

/* Servidor */
server.listen(3000);

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
app.all('/browse/s', openBrowse);


/* GET */
app.get('/entryForm/s', loadEntryForm);
app.get('/login/s', loadLogin);
app.get('/script/:project/s', openScript);
app.get('/newFragment/s',loadNewFragment);
app.get('/projectForm/s', loadProjectForm);
app.get('/project/:project/s', openProject);
app.get('/userForm/s', loadUserForm);
app.get('/user/:user/s', openUserProfile);
app.get('/', openMain);

/* POST */
app.post('/fragmentInfo/s', loadFragmentInfo);
app.post('/fragmentThumb/s', getFragmentThumb);
app.post('/layer/:project/:layer/s', loadLayer);
app.post('/saveCanvas/s', submitCanvas);
app.post('/saveImage/s', submitImage);
app.post('/submitEntry/s', submitEntry);
app.post('/submitProject/s', submitProject);
app.post('/submitScript/s', submitScript);
app.post('/submitUser/s', submitNewUser);
app.post('/logout/s', doLogout);
app.post('/login/s', doLogin);

var session = [];


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
			console.log(session[sid], "a");
			res.send(userInfo);
		},
		printError
	);
}
function doLogout(req, res){
	delete session[req.body.sid];
	res.send('Logged out.');
}
function getFragmentThumb(req, res){
	var project = req.headers['referer'].split('/')[4];
	db.query.for('r').in('test')
          .filter('r._key == @project')
          .collect('time = r.fragments[@index].timestamp')
          .return('{"timestamp": time}');
	db.query.exec({
		'project' : project, 
		'index' : req.body.index})
	.then(
		function(ret){ 
			res.send({
				timestamp : ret[0].timestamp, 
				index : req.body.index});
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
			'fragment' : p.fragments[@index] \
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
			res.render("FragmentInfo", {
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
function loadLayer(req, res){
	res.render("Canvas");
}
function loadNewFragment(req,res){
	res.render('NewFragment');
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
	console.log(db.query.string);
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
function openMain(req,res){
	res.render('Main', {
		logged : session[req.body.sid]
	});
}
function openProject(req, res){
	var project = req.params.project;
			res.render('Proyecto',{
				project : project
			});
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
	var sid = req.params.user;
	db.query.string = "FOR u IN testU FILTER u.name == @user RETURN {'email' : u.email}";
	db.query.exec({'user': user})
	.then(
		function (ret){ 
			if(ret[0] == null){
				res.send('User not found.');
			}
			res.render('UserProfile',{
				user : user,
				email: ret[0].email
			});
		},
		printError
	);
}
function submitCanvas(req, res){
	fragment = {
		"timestamp" : req.body.timestamp,
		"index" : req.body.index,
		"planes" : req.body.planes,
	};
	db.document.get('test/'+req.body.project)
	.then(
		function(ret){ 
			if(session[req.body.sid] == undefined || ret.members.indexOf(session[req.body.sid].user) < 0){
				res.send('Permission dennied.'); 
				return 0
			}
			ret.layers[req.body.layer].fragments[index] = fragment;
			db.document.put(ret);
		},
		printError
	);
	for (var i in req.body.planes){
		fs.exists('public/'+req.body.project+'/'+req.body.layer, function(exists){
			!exists ? fs.mkdir('public/'+req.body.project+'/'+req.body.layer) : printError;
			fs.writeFile('public/'+req.body.project+'/'+req.body.layer+'/'+req.body.fragment+'_'+req.body.timestamp, req.body.planes[i], encoding='utf8', printError);
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
			req.body.related = req.body.related.split(",");
			req.body.tags = req.body.tags.split(",");
			var index = req.body.fragment;
			delete req.body.fragment;
			ret.fragments[index].entries.push(req.body);
			db.document.put(ret._id, ret);
		},
		printError
	);
}
function submitImage(req, res){
	fs.exists('public/'+req.body.dir, function(exists){
		if (!exists) {
			fs.mkdir('public/'+req.body.dir, printError);
		}
		fs.writeFile('public/'+req.body.dir+'/'+req.body.name, req.body.image, encoding='utf8', printError);
	});
}
function submitNewUser(req,res){
	/*Buscar que no haya un nombre de usuario igual*/
	var name = req.body.name;
	var email=req.body.email;
	var pass=req.body.pass;
	db.document.create("testU",{"_key":name+'_'+email, "name":name,"email":email,"pass":pass})
	.then(
		function(ret){
	  		resp.send("User '"+name+"' successfully registered.");
		},
		printError
	)
}
function submitProject(req, res){
	db.use("test")
	req.body._key = req.body.title;
	req.body.fragments = [];
	db.document.create("test", req.body)
	.then(
		function(ret){ 
			res.send("Project correctly submited") 
		},
		printError
	);
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
			console.log(session[req.body.sid], req.body.sid);
			if(session[req.body.sid] == undefined || ret.members.indexOf(session[req.body.sid].user) < 0){
				res.send('Permission dennied.'); 
				return 0
			}
			if (req.body.flag == '2'){
				delete req.body.flag;
				ret.fragments.push(fragments);
			}else{
				ret.fragments = req.body.fragments;
			}
			db.document.put(ret._id, ret);
			res.send("ok");
		},
		printError
	);
}
function printError(err){
	console.log(err);
}




