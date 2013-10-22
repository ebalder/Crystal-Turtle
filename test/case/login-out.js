
/* defs */
var casp;
var screenshot;

function getStorage(){
	return casp.evaluate(function(){
		return {
			user: localStorage.user,
			sid: localStorage.sid
		}
	})
}

function login(user, pass){
	casp.then(function(){
		casp.click('a[href="/login"]');
		casp.waitUntilVisible('.dialog', null, function(){
			error("Login dialog didn't show.")})
	})
	/* fill login form */
	.then(function(){
		casp.fill('#login', {
			name : user,
			pass : pass,
			remember : true
		}, false);
		!screenshot || casp.capture('loginForm_'+ user +'.png');
	})
	/* submit login form */
	.then(function(){
		casp.click('.dialog input[type="submit"]');
		casp.waitForResource('login', null, function(){error('User '+ user +' could not login')});
	})
	/* test login */
	.then(function(){
		!screenshot || casp.captureSelector('loggedHeader_'+ user +'.png', 'header');
		/* evaluate login result */
		casp.test.begin('Login as ' + user, function(test){
			var storage = getStorage();
			var cond = casp.exists('header a[href="/user/'+ user +'"]');
			test.assert(cond, 'Show member area');
			test.assertEquals(storage.user, user, 'Store User');
			test.assert(storage.sid != null, 'Get SID');
			test.done();
		});
	});
}

function logout(casp){
	/* Logout */
	casp.then(function(){
		casp.click('header a[href="/logout"]');
		casp.waitWhileVisible('header a[href="/logout"]', null, function(){
			error("Couldn't logout");
		}, 200)
	})
	/* evaluate logout result */
	.then(function(){
		casp.test.begin('Login out', function(){
			var storage = getStorage();
			test.assert(storage.user == null, 'Forget user');
			test.assert(storage.sid == null, 'Forget SID');
			test.done();
		});
	});
}

/* global functions */
var error = (function(){
	var num = 0;
	return function(msg){
		casp.echo(msg, 'ERROR');
		if(screenshot) {
			casp.capture('error'+ num +'.png');
			casp.echo('Printing error '+ num, 'INFO');
			num++;
		}
	}
})();

function use (casper) {
	casp = casper;
	screenshot = casp.cli.has('screenshot');
}

exports.login = login;
exports.logout = logout;
exports.use = use;
