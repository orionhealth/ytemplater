var expect = require('chai').expect,
	stream = require('stream'),
	PrecompilerTest = require('./precompiler-test');

PrecompilerTest(function(testUtil) {
	var precompiler = testUtil.precompiler;

	describe('generateYuiModuleForTemplates()', function() {
		var mockTemplateCodeSnippets = [
				'// some template code\n',
				'// some more template code\n'
			],
			testTemplateModuleData = {
				name: 'test-template-module',
				dependencies: ['test-additional-dependency-1', 'test-additional-dependency-2'],
				version: '3.1.4'
			},
			yuiModuleContents;

		before(function() {
			var generateModuleStream = precompiler.generateYuiModuleForTemplates(testTemplateModuleData),
				promise = testUtil.streamToPromise(generateModuleStream);

			generateModuleStream.write(mockTemplateCodeSnippets[0]);
			generateModuleStream.end(mockTemplateCodeSnippets[1]);

			return promise.done(function(data) {
				expect(data).to.be.a('string');
				yuiModuleContents = data;
			});
		});

		it('should return a stream for generating a YUI module for precompiled templates', function() {
			expect(precompiler.generateYuiModuleForTemplates({})).to.be.an.instanceOf(stream);
		});

		it('should generate a YUI module with the given module name', function() {
			expect(yuiModuleContents).to.have.string('YUI.add(\'' + testTemplateModuleData.name + '\', function(Y) {');
		});

		it('should generate a YUI module that contains all the streamed in code snippets', function() {
			mockTemplateCodeSnippets.forEach(function(snippet) {
				expect(yuiModuleContents).to.have.string(snippet);
			});
		});

		it('should generate a YUI module with the given version', function() {
			expect(yuiModuleContents).to.have.string('}, \'' + testTemplateModuleData.version + '\',');
		});

		function expectYuiModuleContentsToRequire(moduleContents, moduleName) {
			var requiresDeclaration = ', { requires: [',
				requiresContents;

			expect(moduleContents).to.have.string(requiresDeclaration);

			requiresContents = moduleContents.substring(moduleContents.indexOf(requiresDeclaration));

			expect(requiresContents).to.have.string('\'' + moduleName + '\'');
		}

		it('should generate a YUI module that requires `template-base`', function() {
			expectYuiModuleContentsToRequire(yuiModuleContents, 'template-base');
		});

		it('should generate a YUI module that requires the template engine module', function() {
			expectYuiModuleContentsToRequire(yuiModuleContents, testUtil.engineModuleName);
		});

		it('should generate a YUI module that requires the given additional dependencies', function() {
			testTemplateModuleData.dependencies.forEach(function(additionalDependency) {
				expectYuiModuleContentsToRequire(yuiModuleContents, additionalDependency);
			});
		});

		it('should generate a module that requires `template-base` and the engine even if no extra dependencies given', function(done) {
			var generateModuleStream = precompiler.generateYuiModuleForTemplates({
					name: 'test-module-no-optional-dependencies',
					version: '1.2.3'
				}),
				promise = testUtil.streamToPromise(generateModuleStream);

			generateModuleStream.end('// TODO: implement me');

			promise.done(function(moduleContents) {
				expectYuiModuleContentsToRequire(moduleContents, 'template-base');
				expectYuiModuleContentsToRequire(moduleContents, testUtil.engineModuleName);

				done();
			});
		});
	});
});
