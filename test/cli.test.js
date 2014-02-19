var expect = require('chai').expect,

	exec = require('child_process').exec,
	path = require('path'),
	mkdirp = require('mkdirp'),
	rimraf = require('rimraf');

describe('ytemplater CLI', function() {
	var testOutputDir = path.join(process.cwd(), './test-output/'),
		templatesDir = path.join(__dirname, '/templates/'),
		cli = path.join(__dirname, '../bin/ytemplater');

	function cleanTestOutputDir(done) {
		rimraf(testOutputDir, done);
	}

	beforeEach(function(done) {
		cleanTestOutputDir(function() {
			mkdirp(testOutputDir, done);
		});
	});

	afterEach(cleanTestOutputDir);

	it('should write a JavaScript file to the given output dir', function(done) {
		exec(cli + ' ' + templatesDir + '*.handlebars -o ' + testOutputDir, function(err, stdout, stderr) {
			expect(testOutputDir + 'templates.js').to.be.a.file();

			done();
		});
	});

	it('should write a JavaScript file to the cwd if no output dir is specified', function(done) {
		exec(cli + ' ' + templatesDir + '*.handlebars', { cwd: testOutputDir }, function(err, stdout, stderr) {
			expect(testOutputDir + 'templates.js').to.be.a.file();

			done();
		});
	});
});
