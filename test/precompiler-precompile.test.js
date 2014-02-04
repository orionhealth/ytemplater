var concat = require('concat-stream'),
	expect = require('chai').expect,
	stream = require('stream'),
	PrecompilerTest = require('./precompiler-test'),
	Template = require('yui/template').Template;

PrecompilerTest(function(testUtil) {
	var precompiler = testUtil.precompiler;

	describe('precompile()', function() {
		var testTemplateModuleData = {
				name: 'test-full-module',
				dependencies: ['test-dep-1', 'test-dep-2'],
				version: '7.8.9'
			},
			templateNames = ['food', 'name'],
			yuiModuleContents;

		it('should return a stream for precompiling template files into a single YUI module', function() {
			expect(precompiler.precompile({}, [])).to.be.an.instanceOf(stream);
		});

		it('should read the template files, precompile them and wrap them in a YUI module', function(done) {
			var templatePaths = templateNames.map(testUtil.getTestTemplateFilePath.bind(testUtil)),
				precompileStream = precompiler.precompile(testTemplateModuleData, templatePaths);

			precompileStream.pipe(concat(function(yuiModuleContents) {
				var templater = new Template(testUtil.engine);

				function getExpectedTemplateReviveCode(templateName) {
					var templateContents = testUtil.getTestTemplate(templateName);
					return 'Y.Template.register(\'' + templateName + '\', engine.revive(' + templater.precompile(templateContents) + '));\n\n';
				}

				expect(yuiModuleContents).to.equal(
					'YUI.add(\'' + testTemplateModuleData.name + '\', function(Y) {\n\n' +

					'var engine = new Y.Template(' + testUtil.engineName + ');\n\n' +

					getExpectedTemplateReviveCode(templateNames[0]) +
					getExpectedTemplateReviveCode(templateNames[1]) +

					'}, \'' + testTemplateModuleData.version + '\', { requires: [' +
						'\'template-base\', ' +
						'\'' + testUtil.engineModuleName + '\', ' +
						'\'' + testTemplateModuleData.dependencies[0] + '\', ' +
						'\'' + testTemplateModuleData.dependencies[1] + '\'' +
					'] });'
				);

				done();
			}));
		});
	});
});
