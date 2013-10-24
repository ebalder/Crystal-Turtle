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
   src: __dirname + '/styl',
   dest: __dirname + '/public/css',
   compile: compile
 }));
app.use(express.static('./public')); //esto debe ir después de stylus

/*Global Variables*/
db = new arango.Connection;
db.use("test");
session = [];
peerMembers = [];
projectMembers = [];

/*Dependencies to custom modules*/
var modSession = require("./custom_mods/session"),
modUser = require("./custom_mods/user"),
modFrag = require("./custom_mods/fragment"),
modSearch = require("./custom_mods/search"),
modEntry = require("./custom_mods/entry"),
modIssue = require("./custom_mods/issue"),
modProj = require("./custom_mods/project"),
modScript = require("./custom_mods/script"),
modCanvas = require("./custom_mods/canvas");

/* ALL - areas que pueden ser abiertas o recargadas con diferentes datos */
/* GET */
app.get('/', openMain);
app.get('/browse', openMain);
app.get('/entryForm', modEntry.loadForm);
app.get('/newIssue', modIssue.loadForm);
app.get('/log/:project', openMain);
app.get('/login', modSession.loadForm);
app.get('/newFragment', modFrag.loadForm);
app.get('/project/:project', openMain);
app.get('/projectForm', modProj.loadForm);
app.get('/script/:project', openMain);
app.get('/user/:user', modUser.openProfile);
app.get('/userForm', modUser.loadForm);

/* POST */
app.post('/browse', modSearch.openBrowse);
app.post('/fragmentInfo', modFrag.getInfo);
app.post('/fragmentThumbs', modFrag.getThumbs);
app.post('/infoBoard/:project', modProj.openInfoBoard);
app.post('/InfoTag/:project', modSearch.loadInfoTagSearch);
app.post('/layer/:project/:layer', modCanvas.loadLayer);
app.post('/log/:project', modProj.openLog);
app.post('/login', modSession.login);
app.post('/logout', modSession.logout);
app.post('/project/:project', modProj.open);
app.post('/saveCanvas', modCanvas.submitCanvas);
app.post('/saveImage', modEntry.submitImage);
app.post('/script/:project', modScript.open);
app.post('/setFragTs', modFrag.submitTimestamp);
app.post('/submitEntry', modEntry.submit);
app.post('/submitIssue', modIssue.submit);
app.post('/submitProfileData', modUser.updateProfile);
app.post('/submitProject', modProj.submit);
app.post('/submitScript', modScript.submit);
app.post('/submitUser', modUser.submitNewUser);
app.post('/user/:user', modUser.openProfile);

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
/*Functions*/
function openMain(req,res){
	res.render('main');
}
