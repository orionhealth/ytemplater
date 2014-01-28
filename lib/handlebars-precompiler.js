var Handlebars = require('yui/handlebars').Handlebars,
	Precompiler = require('./precompiler');

module.exports = new Precompiler({
	engine: Handlebars,
	className: 'Y.Handlebars',
	moduleName: 'handlebars-base'
});
