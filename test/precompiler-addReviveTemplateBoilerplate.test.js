var expect = require('chai').expect,
	stream = require('stream'),
	Template = require('yui/template-base').Template,
	PrecompilerTest = require('./precompiler-test');

PrecompilerTest(function(testUtil) {
	var precompiler = testUtil.precompiler;

	describe('addReviveTemplateBoilerplate()', function() {
		var templates = [{
				name: 'food'
			}, {
				name: 'name'
			}],
			boilerplate;

		before(function() {
			var addBoilerplateStream = precompiler.addReviveTemplateBoilerplate(),
				promise = testUtil.streamToPromise(addBoilerplateStream);

			templates.forEach(function(template) {
				template.template = testUtil.getTestTemplate(template.name);
				template.precompiled = new Template(testUtil.engine).precompile(template.template);
			});

			addBoilerplateStream.write(templates[0]);
			addBoilerplateStream.end(templates[1]);

			return promise.then(function(data) {
				// concat-stream should combine all the boilerplate into a single string
				expect(data).to.be.a('string');

				boilerplate = data;
			});
		});

		it('should return a stream for wrapping precompiled templates in revive boilerplate code', function() {
			expect(precompiler.addReviveTemplateBoilerplate()).to.be.an.instanceOf(stream);
		});

		it('should declare the templating engine once before the first template', function() {
			var engineDeclaration = 'var engine = new Y.Template(' + testUtil.engineName + ');',
				indexOf1stDeclaration,
				indexOf2ndDeclaration;

			expect(boilerplate).to.have.string(engineDeclaration);

			indexOf1stDeclaration = boilerplate.indexOf(engineDeclaration);
			expect(indexOf1stDeclaration).to.equal(0, 'expected engine declaration at start of boilerplate.');

			indexOf2ndDeclaration = boilerplate.indexOf(engineDeclaration, engineDeclaration.length);
			expect(indexOf2ndDeclaration).to.equal(-1, 'expected only one engine declaration.');
		});

		it('should wrap each template in boilerplate code to register and revive it', function() {
			templates.forEach(function(template) {
				expect(boilerplate).to.have.string(
					'Y.Template.register(\'' + template.name + '\', engine.revive(' + template.precompiled + '));'
				);
			});
		});

	});
});
