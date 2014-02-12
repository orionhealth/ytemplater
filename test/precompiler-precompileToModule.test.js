var concat = require('concat-stream'),
	expect = require('chai').expect,
	stream = require('stream'),
	PrecompilerTest = require('./precompiler-test');

PrecompilerTest(function(testUtil) {
	var precompiler = testUtil.precompiler;

	describe('precompileToModule()', function() {
		it('should return a stream for precompiling template files into a single YUI module', function() {
			expect(precompiler.precompileToModule({}, [])).to.be.an.instanceOf(stream);
		});

		it('should read the template files, precompile them and wrap them in a YUI module', function(done) {
			var testTemplateModuleData = {
					name: 'test-full-module',
					dependencies: ['test-dep-1', 'test-dep-2'],
					version: '7.8.9'
				},
				templateNames = ['food', 'name'],
				templatePaths = templateNames.map(testUtil.getTestTemplateFilePath.bind(testUtil));

			precompiler
				.precompileToModule(testTemplateModuleData, templatePaths)
				.pipe(concat(function(yuiModuleContents) {
					expect(yuiModuleContents).to.equal(
						'YUI.add(\'' + testTemplateModuleData.name + '\', function(Y) {\n\n' +

						'var ' + testUtil._engineId + 'Engine = new Y.Template(' + testUtil.engineName + ');\n\n' +

						testUtil.getExpectedTemplateReviveCode(templateNames[0]) +
						testUtil.getExpectedTemplateReviveCode(templateNames[1]) +

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
