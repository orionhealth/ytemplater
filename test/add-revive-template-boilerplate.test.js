var expect = require('chai').expect,
	stream = require('stream'),
	testUtils = require('./test-util'),
	Template = require('yui/template-base').Template,

	Engines = require('../lib/engines'),
	addReviveTemplateBoilerplate = require('../lib/add-revive-template-boilerplate');

describe('add-revive-template-boilerplate', function() {
	var templates = [{
			name: 'food',
			engineId: 'handlebars'
		}, {
			name: 'name',
			engineId: 'micro'
		}],
		boilerplate;

	before(function() {
		var addBoilerplateStream = addReviveTemplateBoilerplate(),
			promise = testUtils.streamToPromise(addBoilerplateStream);

		templates.forEach(function(template) {
			var engineId = template.engineId;

			template.template = testUtils.getTestTemplate(template.name, engineId);
			template.precompiled = new Template(Engines[engineId].engine).precompile(template.template);
		});

		addBoilerplateStream.write(templates[0]);
		addBoilerplateStream.end(templates[1]);

		return promise.done(function(data) {
			// concat-stream should combine all the boilerplate into a single string
			expect(data).to.be.a('string');

			boilerplate = data;
		});
	});

	it('should return a stream for wrapping precompiled templates in revive boilerplate code', function() {
		expect(addReviveTemplateBoilerplate()).to.be.an.instanceOf(stream);
	});

	function expectEngineDeclarationBeforeFirstRevive(engineId) {
		var declaration = 'var ' + engineId + 'Engine = new Y.Template(' + Engines[engineId].className + ');',
			indexOfDeclaration,
			indexOfFirstRevive;

		expect(boilerplate).to.have.string(declaration);

		indexOfDeclaration = boilerplate.indexOf(declaration);

		expect(indexOfDeclaration).to.be.at.least(0);
		expect(boilerplate.indexOf(declaration, indexOfDeclaration + 1)).to.equal(-1);

		indexOfFirstRevive = boilerplate.indexOf(engineId + 'Engine.revive(');

		expect(indexOfFirstRevive).to.be.at.least(0);
		expect(indexOfDeclaration).to.be.below(indexOfFirstRevive);
	}

	it('should declare the handlebars templating engine once before the first handlebars template revive', function() {
		expectEngineDeclarationBeforeFirstRevive('handlebars');
	});

	it('should declare the micro templating engine once before the first micro template revive', function() {
		expectEngineDeclarationBeforeFirstRevive('micro');
	});

	it('should wrap each template in boilerplate code to register and revive it', function() {
		templates.forEach(function(template) {
			expect(boilerplate).to.have.string(
				'Y.Template.register(\'' + template.name + '\', ' + template.engineId + 'Engine.revive(' + template.precompiled + '));'
			);
		});
	});
});
