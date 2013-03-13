
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
console.log( __dirname);

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
          .filter('r.project == @project')
          .collect('time = r.fragments[@index]')
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
          .filter('r.project == @project')
          .collect('time = r.fragments[@index]')
          .return('{"timestamp": time}');
    query.exec({
     	project: project, 
     	index: req.body.selection
    })
    .then( 
    	function(ret){ 
     		var timestamp = ret[0].timestamp;
	     	var query = db.query.for('r').in('test')
			     .filter('r.project == @project')
			     .return('{"entries": r.entries, "layers": r.layers}');
			query.exec({
				project: project
			})
			.then( 
				function(ret){  
					var entries = {
						text : [],
						links : [],
						images : []
					};
					var dLayers = ret[0].layers;
					var cLayers = [];
					var found; 
					var dEntries = ret[0].entries;
					for (var i in dEntries.text){ //cada entrada de la cat.
						if(dEntries.text[i].timestamp == timestamp){
							entries.text.push(dEntries.text[i]);
						}
					}
					for (var i in dEntries.links){ //cada entrada de la cat.
						if(dEntries.links[i].timestamp == timestamp){
							entries.links.push(dEntries.links[i]);
						}
					}for (var i in dEntries.images){ //cada entrada de la cat.
						if(dEntries.images[i].timestamp == timestamp){
							entries.images.push(dEntries.images[i]);
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
					res.render("FragmentInfo", {
						text : entries.text,
						images : entries.images,
						links : entries.links,
						eLayers : dLayers.reverse(), //empty layers
						cLayers : cLayers, //layers with contents
						timestamp : timestamp,
						project : project
					});
				},
				printError
			);
		}
	);
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
	db.query.string = "FOR r IN test FILTER r.project == '" + project + "' RETURN{'doc' : r._id}";
	db.query.exec()
	.then(
		function(ret){ 
			db.document.get(ret[0].doc)
			.then( 
				function(ret){
					req.body.related = req.body.related.split(",");
					req.body.tags = req.body.tags.split(",");
					switch (req.body.type){
						case "text":
							delete req.body.type;
							ret.entries.text.push(req.body);
							break;
						case "image":
								delete req.body.content;
								delete req.body.type;
								ret.entries.images.push(req.body);
							break;
						case "link":
							delete req.body.type;
							ret.entries.links.push(req.body);
							break;
					}
					db.document.put(ret._id, ret);
				}
			);
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
	/*db.query.string = "FOR u IN testU FILTER u.Name == @nombre RETURN u";
	db.query.exec()
	.then(
		function(ret){
			console.log("User "+name+" already exists.");
		}
	);*/
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
	db.document.create("test", req.body)
	.then(function(ret){ 
		res.send("Project correctly submited") 
	},
		printError
	);
}
function submitScript(req, res){
	var project = req.headers['referer'].split("/")[4];
	db.query.string = "FOR r IN test FILTER r.project == '" + project + "' RETURN{'doc' : r._id}";
	db.query.exec()
	.then(
		function(ret){ 
					console.log(ret);
			db.document.get(ret[0].doc)
			.then( 
				function(ret){
					ret.script = req.body.script;
					db.document.put(ret._id, ret);
					console.log("ready");
				}
			);
		},
		printError
	);
}
function printError(err){
	console.log(err);
}




