var expect = require('chai').expect,

	path = require('path'),

	cliSpy = require('cli-spy');

describe('ytemplater CLI', function() {
	var cli = cliSpy('./lib/cli', function() {
			var Q = require('q');
			// stub the precompile method to print the passed args to stdout so the test can inspect them
			require('./lib/ytemplater').precompile = function() {
				/*__spy__*/
				return Q();
			};
		}),
		templatesDir = path.join(__dirname, 'templates');

	it('should expand globs to the list of applicable files', function() {
		return cli.exec(path.join(templatesDir, '*.handlebars'))
			.then(function(cliInfo) {
				var files = cliInfo.args[0];

				expect(files).to.be.a('array');
				expect(files).to.have.length(2);

				expect(files).to.contain(path.join(templatesDir, 'name.handlebars'));
				expect(files).to.contain(path.join(templatesDir, 'food.handlebars'));
			});
	});

	it('should pass the output directory specified via --out', function() {
		var outputDir = 'test-output-dir';
		return cli.exec('*.micro --out ' + outputDir)
			.then(function(cliInfo) {
				var options = cliInfo.args[1];

				expect(options).to.contain.keys(['out']);
				expect(options.out).to.equal(outputDir);
			});
	});

	it('should pass the output directory specified via -o', function() {
		var outputDir = 'test-output-dir';
		return cli.exec('*.micro -o ' + outputDir)
			.then(function(cliInfo) {
				var options = cliInfo.args[1];

				expect(options).to.contain.keys(['out']);
				expect(options.out).to.equal(outputDir);
			});
	});

	it('should default the output directory to the cwd', function() {
		return cli.exec('*.micro')
			.then(function(cliInfo) {
				var options = cliInfo.args[1];

				expect(options).to.contain.keys(['out']);
				expect(options.out).to.equal(process.cwd());
			});
	});
});
