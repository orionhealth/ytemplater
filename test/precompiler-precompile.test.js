var concat = require('concat-stream'),
	expect = require('chai').expect,
	stream = require('stream'),

	testUtil = require('./test-util'),

	precompiler = require('../lib/precompiler'),
	Engines = require('../lib/engines'),

	Template = require('yui/template').Template;

describe('precompiler.precompile()', function() {
	var engineIds = Object.keys(Engines);

	it('should return a stream for precompiling template files into a single YUI module', function() {
		expect(precompiler.precompile([])).to.be.an.instanceOf(stream);
	});

	engineIds.forEach(function(engineId) {

		it('should read the template files, precompile them and wrap them in a YUI module', function(done) {
			var engineInfo = Engines[engineId],
				templateNames = ['food', 'name'],
				templatePaths = templateNames.map(function(templateName) {
					return testUtil.getTestTemplateFilePath(templateName, engineId);
				});

			precompiler.precompile(templatePaths)
				.pipe(concat(function(yuiModuleContents) {
					expect(yuiModuleContents).to.equal(
						'var ' + engineId + 'Engine = new Y.Template(' + engineInfo.className + ');\n\n' +

						testUtil.getExpectedTemplateReviveCode(templateNames[0], engineId) +
						testUtil.getExpectedTemplateReviveCode(templateNames[1], engineId)
					);

					done();
				}));
		});
	});
});
