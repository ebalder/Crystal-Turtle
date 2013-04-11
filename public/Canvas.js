
function inicioCanvas(){
	canvas = document.getElementById('canvas');
	imagen = document.getElementById('imagen');
	ctx = canvas.getContext('2d');
	imgctx = imagen.getContext('2d');

	$('input[name="canvasFile"]').on('change', loader.cargar);
	$(canvas).on('mousedown', dibujar);
	$('#enviar').on('click', enviar.bind(this));
	ctx.strokeStyle = "rgb(200,0,0)";
}

var loader = {

	img : new Image(),
	reader : new FileReader(),
	ancho : 1200,
	alto : 650,

	cargar : function(ev){ 
		$(loader.reader).on('load', loader.convertir);
		loader.reader.readAsDataURL(ev.target.files[0]);
	},
	convertir : function(ev){
		loader.img.src = ev.target.result;
		console.log(ev.target.result);
		$(loader.img).on('load', loader.mostrar);
	},
	mostrar : function(){
		switch (true){
			case (loader.img.width > 1200):
				loader.alto = loader.img.height / (loader.img.width / 1200);
				loader.ancho = 1200;
			case (loader.img.height > 650):
				loader.ancho = loader.img.width / (loader.img.height / 650);
				loader.alto = 650;
				break;
		}
		imgctx.canvas.width = loader.img.width;
		imgctx.canvas.height = loader.img.height;
		imgctx.drawImage(loader.img, 0, 0, loader.img.width, loader.img.height);
		imgctx.stroke();

		ctx.canvas.width = loader.img.width;
		ctx.canvas.height = loader.img.height;
		ctx.strokeStyle = "rgb(200,0,0)";
	}
}

function dibujar(ev){
	var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
	var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;
	console.log(ev.clientY);

	$(this).on('mousemove', pintar);
	$(document).on('mouseup', desactivar);
	ctx.beginPath();
    ctx.moveTo(x, y);

	function pintar(ev){
		var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
		var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;
		ctx.lineTo(x, y);
   		ctx.stroke();
	}
	function desactivar (){
		$(canvas).off('mousemove', pintar);
		$(document).off('mouseup', desactivar);
	}
}

function enviar(){
	submit = {
		planes : [canvas.toDataURL("image/png")],
		fragment : viewer.index,
		timestamp : viewer.timestamp,
		project : window.location.pathname.split('/')[2],
		layer : viewer.layer,
		layern : viewer.layern,
		sid : sessionStorage.sid
	};
	$.post("/saveCanvas" + "/s", submit);
	return false;
}


