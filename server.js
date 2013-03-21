
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

/* GET */
app.get('/entryForm', loadEntryForm);
app.get('/project/:project', openProject);
app.get('/script/:project', openScript);
app.get('/newFragment',loadNewFragment);
app.get('/projectForm', loadProjectForm);
app.get('/userForm', loadUserForm);
app.get('/user/:user', openUserProfile);

/* POST */
app.post('/envisioning', loadEnvisioning);
app.post('/fragmentInfo', loadFragmentInfo);
app.post('/fragmentThumb', getFragmentThumb);
app.post('/saveCanvas', submitCanvas);
app.post('/saveImage', submitImage);
app.post('/submitEntry', submitEntry);
app.post('/submitProject', submitProject);
app.post('/submitScript', submitScript);
app.post('/submitUser', submitNewUser);

/* Functions */

function getFragmentThumb(req, res){
	var project = req.headers['referer'].split('/')[4];
	db.query.for('r').in('test')
          .filter('r._key == @project')
          .collect('time = r.fragments[@index].timestamp')
          .return('{"timestamp": time}');
	db.query.exec({
		project : project, 
		index : req.body.index})
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
function loadEnvisioning(req, res){
	res.render('Canvas');
}
function loadFragmentInfo(req, res){
	var project = req.headers['referer'].split('/')[4];
	var query = db.query.for('r').in('test')
		.filter('r._key == @project')
		.collect('\
			fragment = r.fragments[@index],\
			layers = r.layers'
		).return('{\
			"layers" : layers, \
			"fragment" : fragment}'
		); //obtiene el timestamp a consultar
    query.exec({
     	project: project, 
     	index: req.body.selection
    })
    .then( 
    	function(ret){ 
     		var timestamp = null;
			var dEntries = [];
    		if (ret[0].fragment != null){
	     		timestamp = ret[0].fragment.timestamp;
				dEntries = ret[0].fragment.entries;
    		}
			var entries = {
				text : [],
				link : [],
				image : []
			};
			var dLayers = ret[0].layers || [];
			var cLayers = [];
			var found; 
			for (var i in dEntries){ //cada entrada
				if(dEntries[i].type == "text"){
					entries["text"].push(dEntries[i]);
				}
				else if(dEntries[i].type == "image"){
					entries["image"].push(dEntries[i]);
				}
				else if(dEntries[i].type == "link"){
					entries["link"].push(dEntries[i]);
				}
			}
			/*  Buscamos los layers con contenido de este fragmento */
			while (dLayers.length > 0){ //cada capa. 
				found = false;
				for (var i in dLayers[0].fragments){ //cada fragmento en la capa
					if(dLayers[0].fragments[i].timestamp == timestamp){
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
			console.log(ret[0].fragment);
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
function loadNewFragment(req,res){
	res.render('NewFragment');
}
function loadProjectForm(req, res){
	res.render('ProjectForm');
}
function loadUserForm(req,res){
	res.render('UserForm');
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
			console.log(ret[0]);
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

}
function submitEntry(req, res){
	var project = req.headers['referer'].split("/")[4];
	db.document.get('test/'+project)
	.then(
		function(ret){ 
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
	db.document.create("testU",{"name":name,"email":email,"pass":pass})
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
		fragments = req.body.script.fragments;
		for (var i in fragments){
			fragments[i].entries=[];
			fragments[i].timestamp = null;
		}
	}
	db.document.get('test/'+project)
	.then( 
		function(ret){ 
			if (req.body.flag == '2'){
				console.log("dodalalala");
				delete req.body.flag;
				ret.fragments.push(fragments);
			}else{
				ret.fragments = req.body.script.fragments;
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




