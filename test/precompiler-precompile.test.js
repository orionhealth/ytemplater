var concat = require('concat-stream'),
	expect = require('chai').expect,
	stream = require('stream'),
	PrecompilerTest = require('./precompiler-test'),
	Template = require('yui/template').Template;

PrecompilerTest(function(testUtil) {
	var precompiler = testUtil.precompiler;

	describe('precompile()', function() {
		var templateNames = ['food', 'name'];

		it('should return a stream for precompiling template files into a single YUI module', function() {
			expect(precompiler.precompile([])).to.be.an.instanceOf(stream);
		});

		it('should read the template files, precompile them and wrap them in a YUI module', function(done) {
			var templateNames = ['food', 'name'],
				templatePaths = templateNames.map(testUtil.getTestTemplateFilePath.bind(testUtil));

			precompiler.precompile(templatePaths)
				.pipe(concat(function(yuiModuleContents) {
					expect(yuiModuleContents).to.equal(
						'var engine = new Y.Template(' + testUtil.engineName + ');\n\n' +

						testUtil.getExpectedTemplateReviveCode(templateNames[0]) +
						testUtil.getExpectedTemplateReviveCode(templateNames[1])
					);

					done();
				}));
		});
	});
});
