
define(['lib/peer', 'lib/socket.io'], function(peer, io){
	
	var id = sessionStorage.sid;
	var prevX = null;
	var prevY = null;

	var canvas, ctx;

	function incomingData(data){
		if(data.acc == "stroke"){
			var x = data.x;
			var y = data.y;
			canvas = document.getElementById('canvas');
			ctx = canvas.getContext('2d');
			ctx.beginPath();
			ctx.moveTo(prevX, prevY);
			ctx.lineTo(x, y);
			ctx.stroke();

			prevX = x;
			prevY = y;
		}
		else if(data.acc == "press"){
			var x = data.x;
			var y = data.y;
			prevX = x;
			prevY = y;
		}
	}
	function startConnection(){
		console.log("connected to peer");
	}

	function start() {
		if(typeof(peer) != 'object'){
			peer = new Peer(id, {host: 'localhost', port:9000});
			peer.on('connection', function(conn) {
				if(!peer.connections[conn.peer].peerjs.open){
					console.log("incoming connection from ", conn.peer);
					remotes.push(conn.peer);
					peer.connect(conn.peer).on('open', startConnection);
				}
				peer.connections[conn.peer].peerjs.on('data', incomingData);
				peer.connections[conn.peer].peerjs.on('close', function(err){ 
					console.log(conn.peer, err);
				});
			});
			remotes = [];

			console.log('local', id);
			var socket = io.connect('http://localhost:3000');
			socket.on('newPeer', function (data) {
				remotes.push(data.sid);
				peer.connect(data.sid)
				.on('open', startConnection);
				console.log('remote: ', data.sid);
			});
			socket.emit('join', { 
				sid: id, 
				project: window.location.pathname.split( '/' )[2]
				}, function(data){
					remotes = data;
					var len = remotes.length;	
					for(var i = 0; i < len; i++){
						peer.connect(remotes[i])
						.on('open', startConnection); 
						console.log('remote: ', remotes[i]);
					}
				}
			);
		}
		return peer;
	}
	
	return {
		start: start,
	};
});