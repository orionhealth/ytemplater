var concat = require('concat-stream'),
	fs = require('fs'),
	path = require('path'),
	Q = require('q'),
	Template = require('yui/template').Template,

	Engines = require('../lib/engines'),

	TEST_TEMPLATES_DIR = './test/templates/';

// TODO: this needs a big tidy after the refactor

function TestUtil(engineId) {
	// temporary backwards compat while still refactoring
	if (typeof engineId !== 'string') {
		this._precompiler = engineId;
		engineId = this._precompiler._engineId;
	} else {
		this._precompiler = null;
	}

	this._engineId = engineId;
	this._engineData = Engines[engineId];
}

exports.TestUtil = TestUtil;

Object.defineProperty(TestUtil.prototype, 'precompiler', {
	get: function() {
		return this._precompiler;
	}
});

Object.defineProperty(TestUtil.prototype, 'engine', {
	get: function() {
		return this._engineData.engine;
	}
});

Object.defineProperty(TestUtil.prototype, 'engineName', {
	get: function() {
		return this._engineData.className;
	}
});

Object.defineProperty(TestUtil.prototype, 'engineModuleName', {
	get: function() {
		return this._engineData.moduleName;
	}
});

Object.defineProperty(TestUtil.prototype, 'templater', {
	get: function() {
		if (!this._templater) {
			this._templater = new Template(this.engine);
		}
		return this._templater;
	}
});

TestUtil.prototype.getTestTemplate = function(templateName) {
	return getTestTemplate(templateName, this._engineId);
};

TestUtil.prototype.getTestTemplateFilePath = function(templateName) {
	return getTestTemplateFilePath(templateName, this._engineId);
};

TestUtil.prototype.getExpectedTemplateReviveCode = function(templateName) {
	return getExpectedTemplateReviveCode(templateName, this._engineId);
};

function getExpectedTemplateReviveCode(templateName, engineId) {
	var templater = new Template(Engines[engineId].engine),
		precompiledTemplate = templater.precompile(getTestTemplate(templateName, engineId));

	return 'Y.Template.register(\'' + templateName + '\', ' + engineId + 'Engine.revive(' + precompiledTemplate + '));\n\n';
}
exports.getExpectedTemplateReviveCode = getExpectedTemplateReviveCode;

function getTestTemplate(templateName, engineId) {
	return fs.readFileSync(getTestTemplateFilePath(templateName, engineId), { encoding: 'utf8' });
}
exports.getTestTemplate = getTestTemplate;

function getTestTemplateFilePath(templateName, engineId) {
	return path.join(TEST_TEMPLATES_DIR, templateName + '.' + engineId);
}
exports.getTestTemplateFilePath = getTestTemplateFilePath;

function streamToPromise(stream) {
	var deferred = Q.defer();

	stream.pipe(concat(function(data) {
		deferred.resolve(data);
	}));

	stream.on('error', deferred.reject);

	return deferred.promise;
}
exports.streamToPromise = streamToPromise;

// FIXME: temporary backwards compat
TestUtil.prototype.streamToPromise = streamToPromise;
