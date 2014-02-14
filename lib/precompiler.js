var Combine = require('stream-combiner'),
	through = require('through'),

	Handlebars = require('yui/handlebars').Handlebars,
	Template = require('yui/template-base').Template,

	Engines = require('./engines'),
	readTemplateFiles = require('./read-template-files'),
	precompileTemplates = require('./precompile-templates'),
	addReviveTemplateBoilerplate = require('./add-revive-template-boilerplate'),

	yuiModuleStart = Handlebars.compile("YUI.add('{{moduleName}}', function(Y) {\n\n"),
	yuiModuleEnd = Handlebars.compile("}, '{{version}}', { requires: ['template-base'{{#each dependencies}}, '{{.}}'{{/each}}] });");

// engineData = {
//   className: {String} name of the engine class (e.g. 'Y.Handlebars'),
//   engine: {Object} instance of the templating engine (e.g. require('yui/handlebars').Handlebars),
//   moduleName: {String} YUI module name to load the template engine at runtime (e.g. 'handlebars-base')
// }

function Precompiler(engineId) {
	this._engineId = engineId;
	this._engineData = Engines[engineId];
	this._engine = new Template(this._engineData.engine);
}

exports = module.exports = Precompiler;

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

Precompiler.prototype.precompileToModule = function(templateModuleData, filePaths) {
	var pipeline;

	pipeline = Combine(
		precompile(filePaths),
		this.generateYuiModuleForTemplates(templateModuleData)
	);

	return pipeline;
};

// codeBuffer = {Buffer|String} contents to write to the YUI module file (excluding module stamp)
Precompiler.prototype.generateYuiModuleForTemplates = function(templateModuleData) {
	var dependencies = [this._engineData.moduleName],
		yuiModuleDeclared = false;

	if (templateModuleData.dependencies) {
		dependencies = dependencies.concat(templateModuleData.dependencies);
	}

	return through(function(code) {
		if (!yuiModuleDeclared) {
			this.queue(yuiModuleStart({
				moduleName: templateModuleData.name
			}));

			yuiModuleDeclared = true;
		}

		this.queue(code);
	}, function() {
		this.queue(yuiModuleEnd({
			dependencies: dependencies,
			version: templateModuleData.version
		}));

		this.queue(null);
	});
};
