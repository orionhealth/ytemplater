var expect = require('chai').expect,
	mock = require('mock-fs'),
	path = require('path'),

	processShifterModule = require('../lib/process-shifter-module');

describe('process-shifter-module', function() {
	var shifterModuleName = 'test-module',
		mockFs = {};

	afterEach(function() {
		mock.restore();
	});

	function setupShifterModule(folderStructure) {
		mockFs[shifterModuleName] = folderStructure;
		mock(mockFs);
	}

	function setupShifterModuleWithBuildJson(buildJson) {
		setupShifterModule({
			'build.json': JSON.stringify(buildJson)
		});
	}

	it('should export a function', function() {
		expect(processShifterModule).to.be.a('function');
	});

	it('should reject the given module directory if it contains no `build.json`', function() {
		setupShifterModule({});
		return expect(processShifterModule(shifterModuleName)).to.be.rejectedWith(/ENOENT.*build\.json/);
	});

	it('should reject the given module directory if its `build.json` does not contain JSON', function() {
		setupShifterModule({
			'build.json': 'totally not JSON'
		});
		return expect(processShifterModule(shifterModuleName)).to.be.rejectedWith(/Unexpected token/);
	});

	it('should resolve to an empty array if the `build.json` has no `ytemplater` section', function() {
		setupShifterModuleWithBuildJson({});
		return expect(processShifterModule(shifterModuleName)).to.eventually.deep.equal([]);
	});

	it('should resolve to an empty array if the `build.json` has a `ytemplater` section with no template modules declared', function() {
		setupShifterModuleWithBuildJson({
			ytemplater: {}
		});
		return expect(processShifterModule(shifterModuleName)).to.eventually.deep.equal([]);
	});

	it('should resolve to an array of template build data for each template module in the `build.json` ytemplater config', function() {
		var templateConfig = {
			'test-template-module-1': {
				templateFiles: [
					'test-template-module-1-file-1.handlebars',
					'test-template-module-1-file-2.micro'
				]
			},
			'test-template-module-2': {
				templateFiles: [
					'test-template-module-2-file-1.micro'
				]
			}
		};

		setupShifterModuleWithBuildJson({
			ytemplater: templateConfig
		});

		return expect(processShifterModule(shifterModuleName)).to.be.fulfilled
			.then(function(templateBuilds) {
				templateBuilds.forEach(function(templateBuild) {
					var templateModuleName,
						config;

					expect(templateBuild.files).to.be.an('array');
					expect(templateBuild.options).to.be.an('object');

					expect(templateBuild.options.out).to.equal(path.join(shifterModuleName, 'js'));

					templateModuleName = templateBuild.options.moduleName;
					expect(templateConfig).to.have.property(templateModuleName);

					config = templateConfig[templateModuleName];

					expect(templateBuild.files).to.have.length(config.templateFiles.length);
					config.templateFiles.forEach(function(templateFilename) {
						expect(templateBuild.files).to.contain(path.join(shifterModuleName, 'templates', templateFilename));
					});
				});
			});
	});

	it('should filter out template modules that contain no template files', function() {
		var templateConfig = {
			'test-template-module-1': {
				templateFiles: [
					'test-template-module-1-file-1.handlebars',
					'test-template-module-1-file-2.micro'
				]
			},
			'test-template-module-2': {
				templateFiles: []
			}
		};

		setupShifterModuleWithBuildJson({
			ytemplater: templateConfig
		});

		return expect(processShifterModule(shifterModuleName)).to.be.fulfilled
			.then(function(templateBuilds) {
				expect(templateBuilds).to.have.length(1);
				expect(templateBuilds[0].options.moduleName).to.not.equal('test-template-module-2');
			});
	});

	it('should filter out template modules that have no `templateFiles` property', function() {
		var templateConfig = {
			'test-template-module-1': {
				templateFiles: [
					'test-template-module-1-file-1.handlebars',
					'test-template-module-1-file-2.micro'
				]
			},
			'test-template-module-2': {
			}
		};

		setupShifterModuleWithBuildJson({
			ytemplater: templateConfig
		});

		return expect(processShifterModule(shifterModuleName)).to.be.fulfilled
			.then(function(templateBuilds) {
				expect(templateBuilds).to.have.length(1);
				expect(templateBuilds[0].options.moduleName).to.not.equal('test-template-module-2');
			});
	});

});
