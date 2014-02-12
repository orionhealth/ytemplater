var through = require('through'),
	Handlebars = require('yui/handlebars').Handlebars,

	Engines = require('./engines'),

	declareEngine = Handlebars.compile("var {{engine.id}}Engine = new Y.Template({{engine.className}});\n\n"),
	registerTemplate = Handlebars.compile("Y.Template.register('{{name}}', {{engineId}}Engine.revive({{{precompiled}}}));\n\n");

// templateData = {
//   name: {String} name of the template,
//   template: {String} contents of the template,
//   precompiled: {String} string of JavaScript representing the precompiled template,
//   engineId: {String} id of the template engine (matches file extension e.g. "handlebars" or "micro")
// }
function addReviveTemplateBoilerplate() {
	var engineDeclared = {};

	return through(function(templateData) {
		var engineId = templateData.engineId;

		if (!engineDeclared[engineId]) {
			this.queue(declareEngine({
				engine: Engines[engineId]
			}));
			engineDeclared[engineId] = true;
		}

		this.queue(registerTemplate(templateData));
	});
}
exports = module.exports = addReviveTemplateBoilerplate;
