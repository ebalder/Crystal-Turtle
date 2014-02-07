/*brushOptions is used to change the color and size of the brush.*/
define(['lib/jquery', 'lib/jquery-ui'],function($,ui){
	var brush;
	var pickerCanvas;
  	var picker;
  	var preview;
  	var color = '';
  	var img = new Image();
	
	function start(ctx){
		brush = ctx;
		pickerCanvas = document.getElementById('picker');
	  	picker = pickerCanvas.getContext('2d');
	  	preview = document.getElementById('preview').getContext('2d');
	  	console.log('lalala');
		img.src = '/media/toolImg/colorPick.jpg';
		$(img).load(function(){
		    picker.drawImage(img,0,0,300,200);
		});
		pointColor(300,200);
		brush.lineCap = 'round';
		setRGBA();

		//accordion configuration. This is the main container. 
		$(".brushOptions").accordion({
		    collapsible: true,
		    header: 'h3',
		    heightStyle: 'content',
		    active: false
	 	});
		//sliders configuration
		$( "#alphaSlider" ).slider({
		    orientation: "horizontal",
		    range: "min",
		    min: 0,
		    max: 1,
		    step: 0.01,
		    value: 1,
		    slide: function( event, ui ) {
		        $( "#alpha" ).val( ui.value );
		        setRGBA();
		    }
		});
		$( "#sizeSlider" ).slider({
		    orientation: "horizontal",
		    range: "min",
		    min: 1,
		    max: 100,
		    step: 1,
		    value: 5,
		    slide: function( event, ui ) {
		        $('#strokeSize').val(ui.value);
		        brush.lineWidth = $('#strokeSize').val();
		    }
		});
		//Events for colorPicker and stroke size.
		$('#picker').click(pickColor);
		$('.rgba input').on('focusout keypress', inputRGBA);
		$('#strokeSize').on('focusout keypress', setStrokeSize);
		$('#picker').on('mousemove',updatePreview);
		$('#eraser').on('click', eraseMode);
		$('#clear').on('click', function(){
			brush.clearRect(0, 0,$('#canvas').width(),$('#canvas').height());
		});
	}
	function setRGBA(){
	    color = 'rgba('+$('#red').val()+','+$('#green').val()+','+$('#blue').val()+','+$('#alpha').val()+')';
	    preview.clearRect(0, 55, 50,50);
	    preview.fillStyle = color;
	    preview.fillRect(0,55,50,50);
	    //Set the color on preview to brush.
	    brush.strokeStyle = color;
	}
	function pointColor (x,y){
	    picker.clearRect(0, 0, pickerCanvas.width, pickerCanvas.height);
	    picker.drawImage(img,0,0,300,200);
	    picker.beginPath();
	    picker.arc(x,y,2,0,2*Math.PI);
	    picker.stroke();
	}
	/*** Functions called for events for colorPicker ***/
	function pickColor(ev){
	    // getting user coordinates
	    var x = ev.pageX - Math.round($('#picker').offset().left);
    	var y = ev.pageY - Math.round($('#picker').offset().top);
	    // getting image data and RGB values
	    var img_data = picker.getImageData(x, y, 1, 1).data;
	    // making the color the value of the input
	    $('#red').val(img_data[0]);
	    $('#green').val(img_data[1]);
	    $('#blue').val(img_data[2]);
	    pointColor(x,y);
	    setRGBA();
	}
	function inputRGBA(ev){
      	if(ev.which == '13' || ev.which == '9' || ev.type == 'focusout'){
          	if($(ev.target).val()<0 || !$.isNumeric($(ev.target).val())){
            	$(ev.target).val(0);
	       	}
          	if($(ev.target).is('input[id="alpha"]')){
          		if($(ev.target).val()>1){
          			$('#alpha').val(1);
          		}
             	$("#alphaSlider").slider({value: $('#alpha').val()});
          	} else if($(ev.target).val()>255){
	       		$(ev.target).val(255);
	       	}
          	setRGBA();
      	}
 	}
 	function updatePreview(ev){
 		// getting user coordinates
	    var x = ev.pageX - Math.round($('#picker').offset().left);
    	var y = ev.pageY - Math.round($('#picker').offset().top);
	    // getting image data and RGB values
	    var img_data = picker.getImageData(x, y, 1, 1).data;
	    preview.clearRect(0, 0, 50,50);
	    preview.fillStyle = 'rgba('+img_data[0]+','+img_data[1]+','+img_data[2]+','+$('#alpha').val()+')';
	    preview.fillRect(0,0,50,50);
 	}
	/*** Changes the stroke size ***/
  	function setStrokeSize(ev){
	    if(ev.which == '13' || ev.which == '9' || ev.type == 'focusout'){
	        if($('#strokeSize').val()<0 || !$.isNumeric($('#strokeSize').val())){
	          $('#strokeSize').val(0);
	        } 
	        $("#sizeSlider").slider({value: $('#strokeSize').val()});
	        brush.lineWidth = $('#strokeSize').val();
	    }
    }
    function eraseMode(){
    	if($('#eraser>input:checkbox').is(':checked')){
    		brush.globalCompositeOperation = 'destination-out';
    		brush.strokeStyle = 'rgba(0,0,0,1)';
    	}
    	else{
    		brush.globalCompositeOperation = 'source-over';
    		setRGBA();
    	}
    }
    return{
    	start: start
    };
});