var through = require('through'),

	Handlebars = require('yui/handlebars').Handlebars,

	Engines = require('./engines'),

	yuiModuleStart = Handlebars.compile("YUI.add('{{moduleName}}', function(Y) {\n\n"),
	yuiModuleEnd = Handlebars.compile("}, '{{version}}', { requires: ['template-base'{{#each dependencies}}, '{{.}}'{{/each}}] });"),

	ENGINE_DECLARATION = /var\s+(\w+?)Engine\s+=\s+new\s+Y\.Template\(/g;

// templateModuleData = {
//   name: {String} module name,
//   dependencies: {Array} additional module dependencies (optional),
//   version: {String} version of the module (or of the code the module belongs to)
// }

// codeBuffer = {Buffer|String} contents to write to the YUI module file (excluding module stamp)

function generateYuiModuleForTemplates(templateModuleData) {
	var engineModules = [],
		yuiModuleDeclared = false;

	function declareModule() {
		if (!yuiModuleDeclared) {
			this.queue(yuiModuleStart({
				moduleName: templateModuleData.name
			}));

			yuiModuleDeclared = true;
		}
	}

	return through(function(code) {
		var engineDeclMatch,
			engineId;

		declareModule.apply(this);

		engineDeclMatch = new RegExp(ENGINE_DECLARATION).exec(code);

		if (engineDeclMatch) {
			engineId = engineDeclMatch[1];
			engineModules.push(Engines[engineId].moduleName);
		}

		this.queue(code);
	}, function() {
		var moduleDependencies = engineModules;

		declareModule.apply(this);

		if (templateModuleData.dependencies) {
			moduleDependencies = moduleDependencies.concat(templateModuleData.dependencies);
		}

		this.queue(yuiModuleEnd({
			dependencies: moduleDependencies,
			version: templateModuleData.version
		}));

		this.queue(null);
	});
}
exports = module.exports = generateYuiModuleForTemplates;
