
define(function(){
	var cfs = {}; //to return by referenc, cfs has to be an object

	document.documentElement.addEventListener('cfs', function(ev){
	  cfs.cfs = ev.detail;
	}); 
	var askFs = new CustomEvent('cfs-ask');
	document.documentElement.dispatchEvent(askFs);
	
    return cfs;
})