/* jshint expr:true */

var expect = require('chai').expect,
	exec = require('child_process').exec;

describe('ytemplater CLI', function() {
	function expectUsageToBePrinted(err, stdout, stderr) {
		expect(err).to.be.null;
		expect(stderr).to.be.empty;

		expect(stdout).to.contain('Usage: node ./bin/ytemplater [options] files...');
		expect(stdout).to.contain('-h, --help  Show this usage information');
	}

	it('should print usage information on -h', function(done) {
		exec('./bin/ytemplater -h', function(err, stdout, stderr) {
			expectUsageToBePrinted(err, stdout, stderr);

			done();
		});
	});

	it('should print usage information on --help', function(done) {
		exec('./bin/ytemplater --help', function(err, stdout, stderr) {
			expectUsageToBePrinted(err, stdout, stderr);

			done();
		});
	});
});
