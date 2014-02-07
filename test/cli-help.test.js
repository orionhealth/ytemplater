/* jshint expr:true */

var expect = require('chai').expect,
	exec = require('child_process').exec;

describe('ytemplater CLI', function() {
	function expectUsageString(usage) {
		expect(usage).to.contain('Usage: node ./bin/ytemplater [options] files...');
		expect(usage).to.contain('-o, --out   File or directory to write the precompiled templates to');
		expect(usage).to.contain('-h, --help  Show this usage information');
	}

	it('should print usage information on -h', function(done) {
		exec('./bin/ytemplater -h', function(err, stdout, stderr) {
			expect(err).to.be.null;
			expect(stderr).to.be.empty;

			expectUsageString(stdout);

			done();
		});
	});

	it('should print usage information on --help', function(done) {
		exec('./bin/ytemplater --help', function(err, stdout, stderr) {
			expect(err).to.be.null;
			expect(stderr).to.be.empty;

			expectUsageString(stdout);

			done();
		});
	});

	it('should log an error and print usage information to stderr if no files are provided', function(done) {
		exec('./bin/ytemplater', function(err, stdout, stderr) {
			expect(stdout).to.be.empty;

			expect(err).to.exist;

			expectUsageString(stderr);
			expect(stderr).to.contain('At least one file is required.');

			done();
		});
	});
});
