
requirejs.config({
	baseUrl : '/app/modules',
	paths : {
		lib : '/lib',
		project : '/app/modules/studio/boot',
		studio : '/app/modules/studio',
		'lib/jquery' : '/lib/jquery-2.0.3.min'
	},
    shim: {
        'lib/jquery-ui': {
            export: '$',
            deps: ['lib/jquery']
        },
    },
    map: { //only absolute paths work here
    	/* override every call to jquery with jquery-private */
      '*': { 
      	'lib/jquery': 'lib/jquery-wrapper',
      	'lib/peer': 'lib/peer-wrapper'
      }, 
        /* except for the one in jquery-private */
      'lib/jquery-wrapper': { 'lib/jquery': 'lib/jquery' },
      'lib/peer-wrapper': { 'lib/peer': 'lib/peer' }
    }
});

requirejs(['lib/jquery', 'lib/jquery-ui', 'navigation'], function($, ui, nav){
	
	function _init(){
		/* Show or hide buttons from user menu */
		if(localStorage.sid != null || sessionStorage.sid != null){
			nav.login();
		} else {
			$('a[href="/logout"]').hide();
			$('a[href="/projectForm"]').hide();
		}
		/* navigation events */
		$('.load').on('click', nav.load);
		$('.open').on('click', nav.open);
		$('.popup').on('click', nav.dialog);
		$('.logout').on('click', nav.logout);
		/* open hashbang'd path */
		if(window.location.pathname != '/'){
			nav.hash(window.location.pathname);
		}
	}
	if(document.readyState == 'complete'){
		_init();
	} else {
		$(document).on('ready', _init());
	}
});

