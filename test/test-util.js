var _ = require('lodash'),
	concat = require('concat-stream'),
	fs = require('fs'),
	mock = require('mock-fs'),
	path = require('path'),
	Q = require('q'),
	Template = require('yui/template-base').Template,

	Engines = require('../lib/engines'),

	TEMPLATES = {
		'food.handlebars': 'My favorite food is {{food}}.\n',
		'food.micro': 'My favorite food is <%= this.food %>.\n',
		'name.handlebars': 'Hi! My name is {{name}}!\n',
		'name.micro': 'Hi! My name is <%= name %>!\n'
	},

	TEMPLATES_DIR = 'templates',

	mockFileSystemContents = {};

exports.TEMPLATES_DIR = TEMPLATES_DIR;

mockFileSystemContents[TEMPLATES_DIR] = _.merge(TEMPLATES, {
	'not-a-template.txt': 'In ur test data, being an error case.'
});

function mockFileSystem() {
	mock(mockFileSystemContents);
}
exports.mockFileSystem = mockFileSystem;


function restoreFileSystem() {
	mock.restore();
}
exports.restoreFileSystem = restoreFileSystem;


function getExpectedEngineDeclarationCode(engineId) {
	return 'var ' + engineId + 'Engine = new Y.Template(' + Engines[engineId].className + ');\n\n';
}
exports.getExpectedEngineDeclarationCode = getExpectedEngineDeclarationCode;


function getExpectedTemplateReviveCode(templateName, engineId) {
	var templater = new Template(Engines[engineId].engine),
		precompiledTemplate = templater.precompile(getTestTemplate(templateName, engineId));

	return 'Y.Template.register(\'' + templateName + '\', ' + engineId + 'Engine.revive(' + precompiledTemplate + '));\n\n';
}
exports.getExpectedTemplateReviveCode = getExpectedTemplateReviveCode;


function getTestTemplate(templateName, engineId) {
	return TEMPLATES[templateName + '.' + engineId];
}
exports.getTestTemplate = getTestTemplate;


function getTestTemplateFilePath(templateName, engineId) {
	return path.join(TEMPLATES_DIR, templateName + '.' + engineId);
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
