var expect = require('chai').expect,
	path = require('path'),
	Q = require('q'),

	mkdirp = Q.nfbind(require('mkdirp')),

	testUtil = require('./test-util'),

	ytemplater = require('../lib/ytemplater');

describe('ytemplater', function() {

	describe('precompile()', function() {
		var TEMPLATES_DIR = testUtil.TEMPLATES_DIR,
			templates = [path.join(TEMPLATES_DIR, 'name.handlebars')];

		beforeEach(testUtil.mockFileSystem);
		afterEach(testUtil.restoreFileSystem);

		it('should write a JavaScript file to the given output dir', function() {
			var testOutputDir = path.join(process.cwd(), 'test-output');

			return mkdirp(testOutputDir) // TODO: ytemplater should do this
				.then(function() {
					return ytemplater.precompile(templates, { out: testOutputDir });
				})
				.then(function() {
					expect(path.join(testOutputDir, 'templates.js')).to.be.a.file();
				});
		});

		it('should write a JavaScript file to the cwd if no output dir is specified', function() {
			return ytemplater.precompile(templates)
				.then(function() {
					expect(path.join(process.cwd(), 'templates.js')).to.be.a.file();
				});
		});
	});
});
