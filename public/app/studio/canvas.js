/* global define */
'use strict';

define([/*'studio/liveP2p',*/ 'model/frame', 'model/tool'], 
    function(/*live,*/ frame, tool)
{

    var ctx;
    var peer;

    var bufferCanvas = document.createElement('canvas');
    var bufferCtx = bufferCanvas.getContext('2d');

    var fgCanvas = document.createElement('canvas');
    var fgCtx = fgCanvas.getContext('2d');

    var bgCanvas = document.createElement('canvas');
    var bgCtx = bgCanvas.getContext('2d');

    function press(ev){
        var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
        var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;

        ev.target.onmousemove = drag;
        document.onmouseup = release;

        prevx = x;
        prevy = y;

        // var len = remotes.length;
        // var i = 0;
        // for(; i < len; i++){
            // if(typeof(peer.connections[remotes[i]]) == 'object' && peer.connections[remotes[i]].peerjs.open){
            //     peer.connections[remotes[i]].peerjs.send({ 
            //         acc : 'press', 
            //         x : x, 
            //         y : y}
            //     );
            // }
        // }
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
                // var len = remotes.length;
                // var i = 0;
                // for(; i < len; i++){
                    // if(typeof(peer.connections[remotes[i]]) == 'object' && peer.connections[remotes[i]].peerjs.open){
                    //     peer.connections[remotes[i]].peerjs.send({ acc : 'stroke', x : x, y : y});
                    // }
                // }
            }
        }
        function release (){
            ev.target.onmousemove = null;
            document.onmouseup = null;
        }
    }

    var canvas = document.querySelector('canvas.active');
    ctx = canvas.getContext('2d');
    canvas.onmousedown = press;
    tool.ctx = ctx;
    var prevx = 0;
    var prevy = 0;
    //peer = live.start();
    
});
