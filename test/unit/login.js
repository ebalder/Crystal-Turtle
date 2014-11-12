
var boot = require('../boot');
var casp = boot.casp;
var screenshot = boot.screenshot;
var expect = boot.expect;

var session = require('../case/login-out');
session.use(casp);
var utils = require('utils');

/* defs */
var users = [
	{user: 'user1', pass:'user1', valid: true},
	{user: 'nonExistent', pass:'123', valid: false},
	{user: '@test@', pass:'@test@', valid: false},
	{user: '', pass:'', valid: false}
];

casp.start('http://127.0.0.1', function(){
	casp.echo('start...', 'COMMENT');
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
casp.each(users, function(self, curr){
	/* open login form */
	casp.then(function(){
		var user = curr.user;
		var pass = curr.pass;
		var valid = curr.valid;
		casp.echo('Expect ' + valid, 'INFO_BAR');
		session.login(user, pass);
		session.logout();
	});
});

casp.run(function(){
	casp.exit();
});
