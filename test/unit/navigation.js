

/* defs */

var boot = require('../boot');
var casp = boot.casp;
var screenshot = boot.screenshot;
var utils = boot.utils;
var screenshot = boot.screenshot;

var session = require('../case/login-out');
session.use(casp);

var user = casper.cli.get('user') || 'user1';
var pass = casper.cli.get('pass') || user;

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
/* login */
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