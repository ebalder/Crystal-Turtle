

var require = patchRequire(require);

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

/* extends */
casp.error = (function(){
	var num = 0;
	return function(msg){
		casp.echo(msg, 'ERROR');
		if(screenshot) {
			casp.capture('error_'+ num +'.png');
			casp.echo('Printing error '+ num, 'INFO');
			num++;
		}
	}
})();
casp.screenshot = ( function(){
	if(screenshot){
		return function(name, selector){
			if(typeof selector == 'undefined'){
				selector = 'body';
			}
			casp.captureSelector(name, selector);
			casp.echo('Screenshot: ' + name, 'COMMENT');
		}
	}
})();

/* vars */
var screenshot = casp.cli.has('screenshot');

/* exports */
exports.casp = casp;