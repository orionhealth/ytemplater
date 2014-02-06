var concat = require('concat-stream'),
	fs = require('fs'),
	path = require('path'),
	Q = require('q'),
	Template = require('yui/template').Template,

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

Object.defineProperty(PrecompilerTestUtil.prototype, 'precompiler', {
	get: function() {
		return this._precompiler;
	}
});

Object.defineProperty(PrecompilerTestUtil.prototype, 'engine', {
	get: function() {
		return this._precompiler._engineData.engine;
	}
});

Object.defineProperty(PrecompilerTestUtil.prototype, 'engineName', {
	get: function() {
		return this._precompiler._engineData.className;
	}
});

Object.defineProperty(PrecompilerTestUtil.prototype, 'engineModuleName', {
	get: function() {
		return this._precompiler._engineData.moduleName;
	}
});

Object.defineProperty(PrecompilerTestUtil.prototype, 'templater', {
	get: function() {
		if (!this._templater) {
			this._templater = new Template(this.engine);
		}
		return this._templater;
	}
});

PrecompilerTestUtil.prototype.getTestTemplate = function(templateName) {
	return fs.readFileSync(this.getTestTemplateFilePath(templateName), 'utf8');
};

PrecompilerTestUtil.prototype.getTestTemplateFilePath = function(templateName) {
	return path.join('./test/templates/', templateName + '.' + this._precompilerExtension);
};

PrecompilerTestUtil.prototype.getExpectedTemplateReviveCode = function(templateName) {
	var precompiledTemplate = this.templater.precompile(this.getTestTemplate(templateName));
	return 'Y.Template.register(\'' + templateName + '\', engine.revive(' + precompiledTemplate + '));\n\n';
};

PrecompilerTestUtil.prototype.streamToPromise = function(stream) {
	var deferred = Q.defer();

	stream.pipe(concat(function(data) {
		deferred.resolve(data);
	}));

	stream.on('error', deferred.reject);

	return deferred.promise;
};
