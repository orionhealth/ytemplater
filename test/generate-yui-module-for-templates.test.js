var expect = require('chai').expect,
	stream = require('stream'),

	testUtil = require('./test-util'),

	Engines = require('../lib/engines'),
	generateYuiModuleForTemplates = require('../lib/generate-yui-module-for-templates');

describe('generate-yui-module-for-templates', function() {
	var testTemplateModuleData = {
			name: 'test-template-module',
			dependencies: ['test-additional-dependency-1', 'test-additional-dependency-2'],
			version: '3.1.4'
		};

	function generateTestYuiModule(codeSnippets) {
		var generateModuleStream = generateYuiModuleForTemplates(testTemplateModuleData),
			promise = testUtil.streamToPromise(generateModuleStream);

		(codeSnippets || []).forEach(function(snippet) {
			generateModuleStream.write(snippet);
		});

		generateModuleStream.end();

		return promise.then(function(yuiModuleContents) {
			expect(yuiModuleContents).to.be.a('string');
			return yuiModuleContents;
		});
	}

	it('should return a stream for generating a YUI module for precompiled templates', function() {
		expect(generateYuiModuleForTemplates({})).to.be.an.instanceOf(stream);
	});

	it('should generate a YUI module with the given module name', function(done) {
		generateTestYuiModule().done(function(yuiModuleContents) {
			expect(yuiModuleContents).to.have.string('YUI.add(\'' + testTemplateModuleData.name + '\', function(Y) {');

			done();
		});
	});

	it('should generate a YUI module that contains all the streamed in code snippets', function(done) {
		var mockTemplateCodeSnippets = [
			'// some template code\n',
			'// some more template code\n'
		];
		generateTestYuiModule(mockTemplateCodeSnippets).done(function(yuiModuleContents) {
			mockTemplateCodeSnippets.forEach(function(snippet) {
				expect(yuiModuleContents).to.have.string(snippet);
			});

			done();
		});
	});

	it('should generate a YUI module with the given version', function(done) {
		generateTestYuiModule().done(function(yuiModuleContents) {
			expect(yuiModuleContents).to.have.string('}, \'' + testTemplateModuleData.version + '\',');

			done();
		});
	});

	function expectYuiModuleContentsToRequire(moduleContents, moduleName) {
		var requiresDeclaration = ', { requires: [',
			requiresContents;

		expect(moduleContents).to.have.string(requiresDeclaration);

		requiresContents = moduleContents.substring(moduleContents.indexOf(requiresDeclaration));

		expect(requiresContents).to.have.string('\'' + moduleName + '\'');
	}

	it('should generate a YUI module that requires `template-base`', function(done) {
		generateTestYuiModule().done(function(yuiModuleContents) {
			expectYuiModuleContentsToRequire(yuiModuleContents, 'template-base');

			done();
		});
	});

	it('should generate a YUI module that requires the template engine module', function(done) {
		var engineIds = Object.keys(Engines),
			engineModules = [],
			codeSnippets = [];

		engineIds.forEach(function(engineId) {
			engineModules.push(Engines[engineId].moduleName);
			codeSnippets.push(testUtil.getExpectedEngineDeclarationCode(engineId));
		});

		generateTestYuiModule(codeSnippets).done(function(yuiModuleContents) {
			engineModules.forEach(function(engineModuleName) {
				expectYuiModuleContentsToRequire(yuiModuleContents, engineModuleName);
			});

			done();
		});
	});

	it('should generate a YUI module that requires the given additional dependencies', function(done) {
		generateTestYuiModule().done(function(yuiModuleContents) {
			testTemplateModuleData.dependencies.forEach(function(additionalDependency) {
				expectYuiModuleContentsToRequire(yuiModuleContents, additionalDependency);
			});

			done();
		});
	});

	it('should generate a module that requires `template-base` and the engines even if no extra dependencies given', function(done) {
		var generateModuleStream = generateYuiModuleForTemplates({
				name: 'test-module-no-optional-dependencies',
				version: '1.2.3'
			}),
			engineIds = ['handlebars', 'micro'],
			promise = testUtil.streamToPromise(generateModuleStream);

		generateModuleStream.write(testUtil.getExpectedEngineDeclarationCode(engineIds[0]));
		generateModuleStream.end(testUtil.getExpectedEngineDeclarationCode(engineIds[1]));

		promise.done(function(moduleContents) {
			expectYuiModuleContentsToRequire(moduleContents, 'template-base');

			engineIds.forEach(function(engineId) {
				expectYuiModuleContentsToRequire(moduleContents, Engines[engineId].moduleName);
			});

			done();
		});
	});
});
