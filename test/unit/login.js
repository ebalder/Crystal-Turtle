

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
var utils = require('utils');
$ = document.querySelector;

/* defs */
var users = [
	{user: 'user1', pass:'user1', valid: true},
	{user: 'nonExistent', pass:'123', valid: false},
	{user: '@test@', pass:'@test@', valid: false},
	{user: '', pass:'', valid: false}
];
var screenshot = casp.cli.has('screenshot');

casp.start('http://127.0.0.1', function(){
	casp.echo('start...', 'INFO');
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
	casp.each(users, function(self, curr){
		/* fill login form */
		casp.then(function(){
			var user = curr.user;
			var pass = curr.pass;
			var valid = curr.valid;
			casp.click('a[href="/login"]');
			casp.waitUntilVisible('.dialog', function(){
				casp.fill('#login', {
					name : user,
					pass : pass,
					remember : true
				}, false);
				!screenshot || casp.capture('loginForm_'+ user +'.png');
				/* submit login form */
				casp.then(function(){
					casp.click('.dialog input[type="submit"]');
					casp.waitForResource('login', function(){
						!screenshot || casp.captureSelector('loggedHeader_'+ user +'.png', 'header');
						/* evaluate login result */
						casp.test.begin('Tried to login as ' + user, function(test){
							var storage = casp.evaluate(function(){
								return {
									user: localStorage.user,
									sid: localStorage.sid
								}
							});
							if(valid){
								casp.echo('User '+ user +' expected as valid');
								var cond = casp.exists('header a[href="/user/'+ user +'"]');
								test.assert(cond, 'Show member area');
								test.assertEquals(storage.user, user, 'Store User');
								test.assert(storage.sid != null, 'Get SID');
								casp.click('header a[href="/logout"]');
								casp.waitWhileVisible('header a[href="/logout"]', function(){
									casp.click('body');
									var storage = casp.evaluate(function(){
										return {
											user: localStorage.user,
											sid: localStorage.sid
										}
									});
									test.assert(storage.user == null, 'Forget user');
									test.assert(storage.sid == null, 'Forget SID');
								}, function(){
									casp.echo("Couldn't logout", 'ERROR');
								}, 200);
							} else {
								casp.echo('User '+ user +' expected as invalid');
								var cond = casp.visible('header a[href="/logout"]');
								test.assertNot(cond, '(NOT) Show member area');
								test.assert(storage.user == null, '(NOT) Store User');
								test.assert(storage.sid == null, '(NOT) Get SID');
							}
							test.done();
						});
					}, function(){
						casp.echo('User '+ user +' could not login', 'ERROR');
					}, 1000);
				});
			}, function(){
				error();
				casp.echo("Login dialog didn't show.", 'ERROR')
			}, 500);
		});
	});
});

casp.run(function(){
	// utils.dump(casp.test.getFailures());
	casp.exit();
});

var error = (function(){
	var num = 0;
	return function(){
		!screenshot || casp.capture('error'+ num +'.png');
		casp.echo('Printing error '+ num, 'INFO');
		num++;
	}
})();