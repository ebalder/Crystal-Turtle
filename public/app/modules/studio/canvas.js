
define(['studio/liveP2p','studio/brushOptions'], function(live, brushOptions){
	
	var ctx;

	function press(ev){
		var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
		var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;

		ev.target.onmousemove = drag;
		document.onmouseup = release;

		prevx = x;
		prevy = y;

		var len = remotes.length;
		var i = 0;
		for(; i < len; i++){
			if(typeof(peer.connections[remotes[i]]) == 'object' && peer.connections[remotes[i]].peerjs.open){
		    	peer.connections[remotes[i]].peerjs.send({ acc : 'press', x : x, y : y});
		    }
		}
		function drag(ev){
			var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
			var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;
			if(x != prevx || y != prevy){
				ctx.beginPath();
				ctx.moveTo(prevx, prevy);
				ctx.lineTo(x, y);
		   		ctx.stroke();
			    prevx = x;
			    prevy = y;
				var len = remotes.length;
				var i = 0;
				for(; i < len; i++){
					if(typeof(peer.connections[remotes[i]]) == 'object' && peer.connections[remotes[i]].peerjs.open){
				    	peer.connections[remotes[i]].peerjs.send({ acc : 'stroke', x : x, y : y});
				    }
				}
			}
		}
		function release (){
			ev.target.onmousemove = null;
			document.onmouseup = null;
		}
	}

	function openLayer () {
		var canvas = document.getElementById('canvas');
		ctx = canvas.getContext('2d');
		canvas.onmousedown = press;
		brushOptions.start(ctx);
		prevx = 0;
		prevy = 0;
		live.start();
	}
	console.log('openLayer');
	return {
		openLayer : openLayer
	};
});
