var expect = require('chai').expect,
	path = require('path'),
	Q = require('q'),

	mkdirp = Q.nfbind(require('mkdirp')),
	rimraf = Q.nfbind(require('rimraf')),

	ytemplater = require('../lib/ytemplater');

describe('ytemplater', function() {

	describe('precompile()', function() {
		var testOutputDir = path.join(process.cwd(), './test-output/'),
			templatesDir = path.join(__dirname, '/templates/'),
			templates = [path.join(templatesDir, 'name.handlebars')],
			cwdOutputFile = path.join(process.cwd(), 'templates.js');

		function cleanTestOutput() {
			return rimraf(testOutputDir)
				.then(function() {
					return rimraf(cwdOutputFile);
				});
		}

		beforeEach(function() {
			return cleanTestOutput()
				.then(function() {
					mkdirp(testOutputDir);
				});
		});
		afterEach(cleanTestOutput);

		it('should write a JavaScript file to the given output dir', function() {
			return ytemplater.precompile(templates, { out: testOutputDir })
				.then(function() {
					expect(testOutputDir + 'templates.js').to.be.a.file();
				});
		});

		it('should write a JavaScript file to the cwd if no output dir is specified', function(done) {
			return ytemplater.precompile(templates)
				.then(function() {
					expect(cwdOutputFile).to.be.a.file();
				});
		});
	});
});
