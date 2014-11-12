

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

casp.start('http://127.0.0.1/browse', function(){
	casp.echo('start...', 'INFO');
})

/* load page */
.then(function(){
	/* ToDo, add a preloader, then use it to evaluate that the script has ended */
	casp.waitWhileVisible('a[href="/logout"]', function(){
		casp.echo('page loaded', 'INFO');
	}, function(){
		casp.error("User area not setup for unlogged user.");
	}, 1500);
})
/* login */
.then(function(){
	session.login(user, pass);
})
/* open user profile */
.then(function(){
	casp.click('header a[href="/user/'+ user +'"]');
	casp.waitForResource('user/'+ user, function(){ casp.error("Couldn't load user profile")});
})
.then(function(){
	casp.screenshot('userProfile.png');
})

casp.run(function(){
	casp.exit();
});