

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
/* def */
exports.casp = casp;
exports.screenshot = casp.cli.has('screenshot');
exports.utils = require('utils');
exports.$ = document.querySelector;
/* extend */
