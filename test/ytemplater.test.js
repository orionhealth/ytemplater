/* jshint expr:true */

var expect = require('chai').expect,
	mock = require('mock-fs'),
	path = require('path'),
	Q = require('q'),

	mkdirp = Q.nfbind(require('mkdirp')),

	testUtil = require('./test-util'),

	ytemplater = require('../lib/ytemplater');

describe('ytemplater', function() {

	describe('precompile()', function() {
		var TEMPLATES_DIR = testUtil.TEMPLATES_DIR,
			templates = [path.join(TEMPLATES_DIR, 'name.handlebars')],
			cwd = process.cwd();

		beforeEach(testUtil.mockFileSystem);
		afterEach(testUtil.restoreFileSystem);

		it('should write a JavaScript file to the given file', function() {
			var testOutputFile = path.join(cwd, 'test-output-file.js');

			expect(testOutputFile).to.not.be.a.path;

			return ytemplater.precompile(templates, { out: testOutputFile })
				.then(function() {
					expect(testOutputFile).to.be.a.file;
				});
		});

		it('should write a JavaScript file to the given output dir with a default filename of `templates.js`', function() {
			var testOutputDir = path.join(cwd, 'test-output');

			expect(testOutputDir).to.not.be.a.path;

			return ytemplater.precompile(templates, { out: testOutputDir })
				.then(function() {
					expect(path.join(testOutputDir, 'templates.js')).to.be.a.file;
				});
		});

		it('should write a JavaScript file to the given output dir with a filename based on the given `moduleName`', function() {
			var testOutputDir = path.join(cwd, 'test-output'),
				moduleName = 'test-module';

			return ytemplater.precompile(templates, {
						moduleName: moduleName,
						out: testOutputDir
					})
				.then(function() {
					expect(path.join(testOutputDir, moduleName + '.js')).to.be.a.file;
				});
		});

		it('should write a JavaScript file to the cwd if no output dir is specified', function() {
			return ytemplater.precompile(templates)
				.then(function() {
					expect(path.join(cwd, 'templates.js')).to.be.a.file;
				});
		});
	});

	describe('precompileShifterModule()', function() {
		afterEach(function() {
			mock.restore();
		});

		it('should write a JavaScript file to the `js` directory of the given shifter module', function() {
			mock({
				'shifter-module': {
					'build.json': JSON.stringify({
						ytemplater: {
							'test-handlebars-module': {
								templateFiles: [
									'food.handlebars',
									'name.handlebars'
								]
							},
							'test-micro-module': {
								templateFiles: [
									'food.micro',
									'name.micro'
								]
							}
						}
					}),
					'templates': testUtil.TEMPLATES
				}
			});

			return expect(ytemplater.precompileShifterModule('shifter-module')).to.be.fulfilled
				.then(function() {
					var jsFolder = path.join('shifter-module', 'js');

					expect(jsFolder).to.be.a.file;

					expect(path.join(jsFolder, 'test-handlebars-module.js')).to.be.a.file;
					expect(path.join(jsFolder, 'test-micro-module.js')).to.be.a.file;
				});
		});
	});
});
