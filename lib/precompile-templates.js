var through = require('through'),
	Engines = require('./engines');

// templateData = {
//   name: {String} name of the template,
//   engineId: {String} id of the template engine (matches file extension e.g. "handlebars" or "micro"),
//   template: {String} contents of the template
// }
function precompileTemplates() {
	return through(function(templateData) {
		var engine = Engines[templateData.engineId].engine;
		templateData.precompiled = engine.precompile(templateData.template);
		this.queue(templateData);
	});
}

exports = module.exports = precompileTemplates;
