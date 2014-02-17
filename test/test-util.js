var concat = require('concat-stream'),
	fs = require('fs'),
	path = require('path'),
	Q = require('q'),
	Template = require('yui/template').Template,

	Engines = require('../lib/engines'),

	TEST_TEMPLATES_DIR = './test/templates/';


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
