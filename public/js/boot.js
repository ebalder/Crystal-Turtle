

requirejs.config({
	baseUrl : 'js/modules',
	paths : {
		lib : '../../libs',
	},
    shim: {
        'lib/jquery-ui': {
            export: '$',
            deps: ['lib/jquery']
        },
    },
    map: { //only absolute paths work here
    	/* override every call to jquery with jquery-private */
      '*': { 'lib/jquery': 'lib/jquery-wrapper' }, 
        /* except for the one in jquery-private */
      'lib/jquery-wrapper': { 'lib/jquery': 'lib/jquery' }
    }
});

requirejs(['lib/jquery', 'lib/jquery-ui', 'navigation'], function($, ui, nav){
	$(document).on('ready', _init);
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
		$('.logout').on('click', nav.logout);
		/* open hashbang'd path */
		if(window.location.pathname != '/'){
			nav.hash(window.location.pathname);
		}
	}
	function stopPropagation(event){
		event.stopPropagation();
	}
	function destroyDialog(event){
		$('.dialog').remove();
		typeof(initDialog) != "undefined" 
			? delete initDialog
			: null;
	}
});

