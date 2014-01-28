var Micro = require('yui/template-micro').Template.Micro,
	Precompiler = require('./precompiler');

module.exports = new Precompiler({
	engine: Micro,
	className: 'Y.Template.Micro',
	moduleName: 'template-micro'
});
