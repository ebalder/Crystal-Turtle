

/* config */
var casp = require('casper').create({
	verbose: casper.cli.has('verbose'),
	logLevel: casper.cli.get('verbose') || null,
	onError : error,
	viewportSize: {
		width: 1240,
		height: 780 
	},
	imgOptions: {
		format: '.png',
		quality: '1',
		compression: '9'
	}
});

/* functions */
var require = patchRequire(require);
var utils = require('utils');
$ = document.querySelector;
var session = require('../../../case/login-out');
session.use(casp);

/* defs */
var user = casper.cli.get('user') || 'user1';
var pass = casper.cli.get('pass') || user;
var screenshot = casp.cli.has('screenshot');

casp.start('http://127.0.0.1', function(){
	casp.echo('start...', 'COMMENT');
})

/* load page */
.then(function(){
	/* ToDo, add a preloader, then use it to evaluate that the script has ended */
	casp.waitWhileVisible('a[href="/logout"]', function(){
		casp.echo('page loaded', 'INFO');
	}, function(){
		casp.echo("User area not setup for unlogged user.", 'ERROR');
	}, 1500);
})
.then(function(){
	session.login(user, pass);
})

casp.run(function(){
	casp.exit();
});

/* global functions */
var error = (function(){
	var num = 0;
	return function(){
		!screenshot || casp.capture('error'+ num +'.png');
		casp.echo('Printing error '+ num, 'INFO');
		num++;
	}
})();

function getStorage(){
	return casp.evaluate(function(){
		return {
			user: localStorage.user,
			sid: localStorage.sid
		}
	})
}