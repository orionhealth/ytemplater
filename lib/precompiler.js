var Combine = require('stream-combiner'),

	readTemplateFiles = require('./read-template-files'),
	precompileTemplates = require('./precompile-templates'),
	addReviveTemplateBoilerplate = require('./add-revive-template-boilerplate'),
	generateYuiModuleForTemplates = require('./generate-yui-module-for-templates');

function precompile(filePaths) {
	var pipeline;

	pipeline = Combine(
		readTemplateFiles(),
		precompileTemplates(),
		addReviveTemplateBoilerplate()
	);

	filePaths.forEach(pipeline.write.bind(pipeline));
	pipeline.end();

	return pipeline;
}
exports.precompile = precompile;

// templateModuleData = {
//   name: {String} module name,
//   dependencies: {Array} additional module dependencies (optional),
//   version: {String} version of the module (or of the code the module belongs to)
// }

function precompileToModule(filePaths, templateModuleData) {
	return Combine(
		precompile(filePaths),
		generateYuiModuleForTemplates(templateModuleData)
	);
}
exports.precompileToModule = precompileToModule;
