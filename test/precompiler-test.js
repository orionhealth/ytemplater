var TestUtil = require('./test-util').TestUtil,

	precompilers = ['handlebars-precompiler', 'micro-precompiler'];

function PrecompilerTest(testFn) {
	precompilers.forEach(function(precompiler) {
		describe(precompiler, function() {
			testFn(new TestUtil(require('../lib/' + precompiler)));
		});
	});
}

exports = module.exports = PrecompilerTest;
