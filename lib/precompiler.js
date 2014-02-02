var Combine = require('stream-combiner'),
	fs = require('fs'),
	mapStream = require('map-stream'),
	path = require('path'),
	Q = require('q'),
	through = require('through'),

	Handlebars = require('yui/handlebars').Handlebars,
	Template = require('yui/template-base').Template,

	yuiModuleStart = Handlebars.compile("YUI.add('{{moduleName}}', function(Y) {\n\n"),
	yuiModuleEnd = Handlebars.compile("}, '{{version}}', { requires: ['template-base'{{#each dependencies}}, '{{.}}'{{/each}}] });"),
	declareEngine = Handlebars.compile("var engine = new Y.Template({{engine.className}});\n\n"),
	registerTemplate = Handlebars.compile("Y.Template.register('{{name}}', engine.revive({{{precompiled}}}));\n\n");

// engineData = {
//   className: {String} name of the engine class (e.g. 'Y.Handlebars'),
//   engine: {Object} instance of the templating engine (e.g. require('yui/handlebars').Handlebars),
//   moduleName: {String} YUI module name to load the template engine at runtime (e.g. 'handlebars-base')
// }

function Precompiler(engineData) {
	this._engine = new Template(engineData.engine);
	this._engineData = engineData;
}

exports = module.exports = Precompiler;

// templateModuleData = {
//   name: {String} module name,
//   dependencies: {Array} additional module dependencies (optional),
//   version: {String} version of the module (or of the code the module belongs to)
// }

// TODO: better name?
Precompiler.prototype.precompile = function(templateModuleData, filePaths) {
	var pipeline;

	pipeline = Combine(
		this.readTemplateFiles(),
		this.precompileTemplates(),
		this.addReviveTemplateBoilerplate(),
		this.generateYuiModuleForTemplates(templateModuleData)
	);

	filePaths.forEach(pipeline.write.bind(pipeline));
	pipeline.end();

	return pipeline;
};

// templateFilePath = {String} path to template file
Precompiler.prototype.readTemplateFiles = function() {
	return mapStream(function(templateFilePath, callback) {
		// TODO: test case?
		if (!templateFilePath) {
			return callback(null, templateFilePath);
		}

		fs.readFile(templateFilePath, 'utf8', function(err, template) {
			if (err) {
				return callback(err);
			}

			callback(null, {
				name: path.basename(templateFilePath, path.extname(templateFilePath)),
				template: template
			});
		});
	});
};

// templateData = {
//   name: {String} name of the template,
//   template: {String} contents of the template
// }
Precompiler.prototype.precompileTemplates = function() {
	var engine = this._engine;

	return through(function(templateData) {
		templateData.precompiled = engine.precompile(templateData.template);
		this.queue(templateData);
	});
};

// templateData = {
//   name: {String} name of the template,
//   template: {String} contents of the template,
//   precompiled: {String} string of JavaScript representing the precompiled template
// }
Precompiler.prototype.addReviveTemplateBoilerplate = function() {
	var engineDeclared = false,
		engineDeclaration = declareEngine({ engine: this._engineData });

	return through(function(templateData) {
		if (!templateData) {
			return;
		}

		if (!engineDeclared) {
			this.queue(engineDeclaration);
			engineDeclared = true;
		}

		this.queue(registerTemplate(templateData));
	});
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
