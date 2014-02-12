var Handlebars = require('yui/handlebars').Handlebars,
	Micro = require('yui/template-micro').Template.Micro;

// Map of engine data by template file extension
exports = module.exports = {
	handlebars: {
		id: 'handlebars',
		engine: Handlebars,
		className: 'Y.Handlebars',
		moduleName: 'handlebars-base'
	},
	micro: {
		id: 'micro',
		engine: Micro,
		className: 'Y.Template.Micro',
		moduleName: 'template-micro'
	}
};
