

var casper = require('casper').create({
	verbose: false,
	logLevel: 'debug'
});
var utils = require('utils');
$ = document.querySelector;

user = 'user1';

casper.test.begin('Login', function(){
	casper.start('http://127.0.0.1', function(){
		console.log('start...');
	})
});
casper.then(function(){
	casper.click('a[href="/login"]');
})
.then(function(){
	casper.capture('asdf.png', {top:0, left:0, width:800, height:900});
	casper.fill('#login', {
		name : user,
		pass : user
	}, true);
})
.then(function(){
	var cond = casper.fetchText('a[href="/logout"]') == user;
	casper.test.begin('Correctly logged in', 1, function(){
		casper.test.assert(cond, 'Show member area');
		utils.dump(getFailures());
		casper.test.done();
	});
});

casper.run(function(){
	// utils.dump(casper.test.getFailures());
	casper.exit();
});