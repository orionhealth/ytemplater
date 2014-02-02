var expect = require('chai').expect,
	stream = require('stream'),
	PrecompilerTest = require('./precompiler-test'),
	Template = require('yui/template').Template;

PrecompilerTest(function(testUtil) {
	var precompiler = testUtil.precompiler,
		engineName = testUtil.engineName;

	describe('precompileTemplates()', function() {
		it('should return a stream for precompiling YUI ' + engineName + ' templates', function() {
			expect(precompiler.precompileTemplates()).to.be.an.instanceOf(stream);
		});

		function precompile() {
			var precompileStream = precompiler.precompileTemplates(),
				promise = testUtil.streamToPromise(precompileStream);

			precompileStream.end({
				name: 'test-template',
				template: testUtil.getTestTemplate('food')
			});

			return promise.then(function(data) {
				return data[0];
			});
		}

		function expectTemplateToBeAStringOfJavaScript(precompiledTemplate) {
			expect(precompiledTemplate).to.be.a('string');
			expect(precompiledTemplate).to.have.string('function');
		}

		it('should precompile a streamed template to a string of JavaScript', function() {
			return precompile().then(function(templateData) {
				var precompiledTemplate = templateData.precompiled;

				expectTemplateToBeAStringOfJavaScript(precompiledTemplate);
			});
		});

		it('should precompile multiple template files', function() {
			var precompileStream = precompiler.precompileTemplates(),
				promise = testUtil.streamToPromise(precompileStream),
				templates = [{
					name: 'test-template1',
					template: testUtil.getTestTemplate('name')
				}, {
					name: 'test-template2',
					template: testUtil.getTestTemplate('food')
				}];

			precompileStream.write(templates[0]);
			precompileStream.end(templates[1]);

			return promise.then(function(precompiledTemplates) {
				expect(precompiledTemplates).to.have.length(2);

				expect(precompiledTemplates[0].name).equal(templates[0].name);
				expectTemplateToBeAStringOfJavaScript(precompiledTemplates[0].precompiled);

				expect(precompiledTemplates[1].name).equal(templates[1].name);
				expectTemplateToBeAStringOfJavaScript(precompiledTemplates[1].precompiled);
			});
		});

		function evalTemplateFunctionString(templateStr) {
			/* jshint evil: true */
			return eval('(function(){return ' + templateStr + ';}())');
			/* jshint evil: false */
		}

		it('should precompile to JavaScript that is revivable with the YUI ' + engineName + ' Template engine', function() {
			return precompile().then(function(templateData) {
				var templater = new Template(testUtil.engine),
					templateFn = templater.revive(evalTemplateFunctionString(templateData.precompiled)),
					data = { food: 'cake' };

				expect(templateFn(data)).to.equal('My favorite food is cake.\n');
			});
		});
	});
});
