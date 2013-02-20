
/* Dependencias */
var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	cons = require('consolidate'),
	stylus = require('stylus'),
	nib = require('nib'),
	arango = require('arango.client');

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
app.get(/\/project\/[^\/]*/, loadProject);
app.get('/canvas', loadAnnotations);
app.get('/entryForm', loadEntryForm);
app.get('/projectForm', loadProjectForm);

/* POST */
app.post('/fragmentInfo', fragmentInfo);
app.post('/fragmentThumb', fragmentThumb);
app.post('/submitEntry', submitEntry);
app.post('/submitProject', submitProject);
app.post('/saveCanvas', saveCanvas);
app.post('/envisioning', loadCanvas);

/* Functions */
function fragmentInfo(req, res){
	var timestamp;
	project=req.headers['referer'].replace(/(http:\/\/[^\/]*\/project\/|\?.*)/g, '').replace(/\/.*/g, '');
	query = db.query.for('r').in('test')
          .filter('r.project == @project')
          .collect('time = r.fragments[@index]')
          .return('{"timestamp": time}');
     query.exec({project: project, index: req.body.selection - 1}).then(
     	function(data){ timestamp = data[0].timestamp;},
		function(err){ console.log("err",err) }
     ).then(function(data){ 
     	query = db.query.for('r').in('test')
		     .filter('r.project == @project')
		     .return('{"entries": r.entries, "layers": r.layers}');
		query.exec({project: project}).then( 
			function(data){  
				var entries = {
					text : []
				};
				var dLayers = data[0].layers;
				var cLayers = [];
				var found; 
				var dEntries = data[0].entries;
				for (var i in dEntries.text){ //cada entrada de la cat.
					if(dEntries.text[i].timestamp == timestamp){
						entries.text.push(dEntries.text[i]);
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
					eLayers : dLayers.reverse(), //empty layers
					cLayers : cLayers, //layers with contents
					timestamp : timestamp,
					project : project
				});
			},
			function(err){ console.log("err",err) }
		);
	});
}
function fragmentThumb(req, res){
	project=req.headers['referer'].replace(/(http:\/\/[^\/]*\/project\/|\?.*)/g, '').replace(/\/.*/g, '');
	db.query.for('r').in('test')
          .filter('r.project == @project')
          .collect('time = r.fragments[@index]')
          .return('{"timestamp": time}');
	db.query.exec({project : project, index : req.body.index-1}).then(
		function(data){ res.send({timestamp : data[0].timestamp, index : req.body.index});},
		function(err){ console.log("err",err);}
	);
}
function loadAnnotations(req, res){
	res.render('Canvas',{
		proyecto : "Demo"
	});
}
function loadCanvas(req, resp){
	resp.render("Canvas", {

	}); 
}
function loadEntryForm(req, res){
	res.render('EntryForm',{
		proyecto : "Demo"
	});
}
function loadProject(req, res){
	project=req.originalUrl.replace(/(\/project\/|\?.*)/g, '').replace(/\/.*/g, '');
	res.render('Proyecto',{
		proyecto : project
	});
}
function loadProjectForm(req, res){
	res.render('ProjectForm');
}
function saveCanvas(req, resp){

}
function submitEntry(req, resp){
	project=req.headers['referer'].split("/")[4];
	console.log(project);
	db.query.string = "FOR r IN test FILTER r.project == '" + project + "' RETURN{'doc' : r._id}";
	db.query.exec().then(
		function(res){
			db.document.get(res[0].doc).then(
				function(res){
					req.body.related = req.body.related.split(",");
					req.body.tags = req.body.tags.split(",");
					res.entries.text.push(req.body);
					db.document.put(res._id, res).then(
						function(res){console.log('Insertado: ', res); resp.send("ok")}
					);
				}
			);
		},
		function(err){console.log(err)}
	);
}
function submitProject(req, resp){
	db.document.create("test", req.body).then(
		function(res){ resp.send("Project correctly submited") },
		function(err){ resp.send(err)}
	);
}




