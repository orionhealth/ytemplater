var expect = require('chai').expect,
	stream = require('stream'),
	Template = require('yui/template-base').Template,

	testUtil = require('./test-util'),

	Engines = require('../lib/engines'),
	precompileTemplates = require('../lib/precompile-templates');

describe('precompile-templates', function() {
	var engineIds = Object.keys(Engines);

	it('should export a function', function() {
		expect(precompileTemplates).to.be.a('function');
	});

	it('should return a stream for precompiling YUI templates', function() {
		expect(precompileTemplates()).to.be.an.instanceOf(stream);
	});

	function expectTemplateToBeAStringOfJavaScript(precompiledTemplate) {
		expect(precompiledTemplate).to.be.a('string');
		expect(precompiledTemplate).to.have.string('function');
	}

	engineIds.forEach(function(engineId) {
		var engineInfo = Engines[engineId];

		function precompile() {
			var precompileStream = precompileTemplates(),
				promise = testUtil.streamToPromise(precompileStream, engineId);

			precompileStream.end({
				name: 'test-template',
				engineId: engineId,
				template: testUtil.getTestTemplate('food', engineId)
			});

			return promise.then(function(data) {
				return data[0];
			});
		}

		it('should precompile a streamed template to a string of JavaScript', function(done) {
			precompile().done(function(templateData) {
				var precompiledTemplate = templateData.precompiled;

				expectTemplateToBeAStringOfJavaScript(precompiledTemplate);

				done();
			});
		});

		it('should precompile multiple template files', function(done) {
			var precompileStream = precompileTemplates(),
				promise = testUtil.streamToPromise(precompileStream, engineId),
				templates = [{
					name: 'test-template1',
					engineId: engineId,
					template: testUtil.getTestTemplate('name', engineId)
				}, {
					name: 'test-template2',
					engineId: engineId,
					template: testUtil.getTestTemplate('food', engineId)
				}];

			precompileStream.write(templates[0]);
			precompileStream.end(templates[1]);

			promise.done(function(precompiledTemplates) {
				expect(precompiledTemplates).to.have.length(2);

				expect(precompiledTemplates[0].name).equal(templates[0].name);
				expectTemplateToBeAStringOfJavaScript(precompiledTemplates[0].precompiled);

				expect(precompiledTemplates[1].name).equal(templates[1].name);
				expectTemplateToBeAStringOfJavaScript(precompiledTemplates[1].precompiled);

				done();
			});
		});

		function evalTemplateFunctionString(templateStr) {
			/* jshint evil: true */
			return eval('(function(){return ' + templateStr + ';}())');
			/* jshint evil: false */
		}

		it('should precompile to JavaScript that is revivable with the YUI ' + engineInfo.className + ' Template engine', function(done) {
			precompile().done(function(templateData) {
				var templater = new Template(engineInfo.engine),
					data = { food: 'cake' },
					templateFn;

				if (engineInfo.className === 'Y.Handlebars') {
					templateFn = templater.revive(evalTemplateFunctionString(templateData.precompiled), templater.engine);
				} else {
					templateFn = templater.revive(evalTemplateFunctionString(templateData.precompiled));
				}

				expect(templateFn(data)).to.equal('My favorite food is cake.\n');

				done();
			});
		});
	});

	it('should precompile multiple template files from different templating engines', function(done) {
		var precompileStream = precompileTemplates(),
			promise = testUtil.streamToPromise(precompileStream),
			templates = [{
				name: 'test-template1',
				engineId: 'handlebars',
				template: testUtil.getTestTemplate('name', 'handlebars')
			}, {
				name: 'test-template2',
				engineId: 'micro',
				template: testUtil.getTestTemplate('food', 'micro')
			}];

		precompileStream.write(templates[0]);
		precompileStream.end(templates[1]);

		promise.done(function(precompiledTemplates) {
			expect(precompiledTemplates).to.have.length(2);

			expect(precompiledTemplates[0].name).equal(templates[0].name);
			expectTemplateToBeAStringOfJavaScript(precompiledTemplates[0].precompiled);

			expect(precompiledTemplates[1].name).equal(templates[1].name);
			expectTemplateToBeAStringOfJavaScript(precompiledTemplates[1].precompiled);

			done();
		});
	});
});
