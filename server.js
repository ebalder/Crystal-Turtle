
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
console.log("localhost:3000");

/* Usar nib en Stylus */
function compile(str, path) {
	console.log("Parsing css");
	return stylus(str).set('filename', path).use(nib());
}

/* Configuraciones de los módulos */
app.engine('.html', cons.jade);
app.set('view engine', 'html');
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
app.get('/demoproject', loadProject);
app.get('/canvas', loadAnnotations);
app.get('/entryForm', loadEntryForm);

/* POST */
app.post('/fragmentInfo', fragmentInfo);
app.post('/fragmentThumb', fragmentThumb);
app.post('/submitEntry', submitEntry)

/* Functions */
function fragmentInfo(req, res){
	var timestamp;
	query = db.query.for('r').in('test')
          .filter('r.project == @project')
          .collect('time = r.fragments[@index]')
          .return('{"timestamp": time}');
     query.exec({project: "Demo1", index: req.body.selection - 1}).then(
     	function(data){ timestamp = data[0].timestamp;},
		function(err){ console.log("err",err) }
     ).then(function(data){ 
     	query = db.query.for('r').in('test')
		     .filter('r.project == @project')
		     .collect('info = r.entries')
		     .return('{"info": info}');
		query.exec({project: "Demo1"}).then(
			function(data){  
				var entries = {
					text : []
				};
				for (var i in data[0].info.text){ //cada entrada de la cat.
					if(data[0].info.text[i].timestamp == timestamp){
						entries.text.push(data[0].info.text[i]);
					}
				}
				res.render("FragmentInfo", entries);
			},
			function(err){ console.log("err",err) }
		);
	});
}
function fragmentThumb(req, res){
	query = db.query.for('r').in('test')
          .filter('r.project == @project')
          .collect('time = r.fragments[@index]')
          .return('{"timestamp": time}');
	query.exec({project : "Demo1", index : req.body.index-1}).then(
		function(data){ res.send({timestamp : data[0].timestamp, index : req.body.index});},
		function(err){ console.log("err",err) }
	);
}
function loadAnnotations(req, res){
	res.render('Canvas',{
		proyecto : "Demo"
	});
}
function loadEntryForm(req, res){
	res.render('EntryForm',{
		proyecto : "Demo"
	});
}
function loadProject(req, res){
	res.render('Proyecto',{
		proyecto : "Demo"
	});
}
function submitEntry(req, resp){
	project=req.headers['referer'].replace(/(http:\/\/[^\/]*\/|\?.*)/g, '').replace(/\/[.]*/g, '');
	db.query.string = "FOR r IN test FILTER r.project == " + "'Demo1'" + " RETURN{'doc' : r._id}";
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





