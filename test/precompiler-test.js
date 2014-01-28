var concat = require('concat-stream'),
	fs = require('fs'),
	path = require('path'),
	Q = require('q'),

	precompilers = ['handlebars-precompiler', 'micro-precompiler'];

function PrecompilerTest(testFn) {
	precompilers.forEach(function(precompiler) {
		describe(precompiler, function() {
			testFn(new PrecompilerTestUtil(require('../lib/' + precompiler)));
		});
	});
}

exports = module.exports = PrecompilerTest;

function PrecompilerTestUtil(precompiler) {
	this._precompiler = precompiler;
	this._precompilerExtension = precompiler._engineData.moduleName === 'handlebars-base' ? 'handlebars' : 'micro';
}

PrecompilerTestUtil.prototype = {
	get precompiler () {
		return this._precompiler;
	},

	get engine () {
		return this._precompiler._engineData.engine;
	},

	get engineName () {
		return this._precompiler._engineData.className;
	},

	getTestTemplate: function(templateName) {
		return fs.readFileSync(this.getTestTemplateFilePath(templateName), { encoding: 'utf8' });
	},

	getTestTemplateFilePath: function(templateName) {
		return path.join('./test/templates/', templateName + '.' + this._precompilerExtension);
	},

	streamToPromise: function(stream) {
		var deferred = Q.defer();

		stream.pipe(concat(function(data) {
			deferred.resolve(data);
		}));

		stream.on('error', deferred.reject);

		return deferred.promise;
	}
};
