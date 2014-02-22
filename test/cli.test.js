var expect = require('chai').expect,

	exec = require('child_process').exec,
	path = require('path'),
	Q = require('q');

describe('ytemplater CLI', function() {
	var cli = path.join(__dirname, 'cli-spy'),
		argStrRegexp = /__spy__(.*)__spy__/,
		templatesDir = path.join(__dirname, 'templates');

	function execCli(argStr, opts) {
		var deferred = Q.defer();

		exec(cli + ' ' + argStr, opts || {}, function(err, stdout, stderr) {
			if (err) {
				return deferred.reject(err);
			}

			var spiedArgStr = stdout.match(argStrRegexp)[1];
			deferred.resolve(JSON.parse(spiedArgStr));
		});

		return deferred.promise;
	}

	it('should expand globs to the list of applicable files', function() {
		return execCli(path.join(templatesDir, '*.handlebars'))
			.then(function(args) {
				var files = args[0];

				expect(files).to.be.a('array');
				expect(files).to.have.length(2);

				expect(files).to.contain(path.join(templatesDir, 'name.handlebars'));
				expect(files).to.contain(path.join(templatesDir, 'food.handlebars'));
			});
	});

	it('should pass the output directory specified via --out', function() {
		var outputDir = 'test-output-dir';
		return execCli('*.micro --out ' + outputDir)
			.then(function(args) {
				var options = args[1];

				expect(options).to.contain.keys(['out']);
				expect(options.out).to.equal(outputDir);
			});
	});

	it('should pass the output directory specified via -o', function() {
		var outputDir = 'test-output-dir';
		return execCli('*.micro -o ' + outputDir)
			.then(function(args) {
				var options = args[1];

				expect(options).to.contain.keys(['out']);
				expect(options.out).to.equal(outputDir);
			});
	});

	it('should default the output directory to the cwd', function() {
		return execCli('*.micro')
			.then(function(args) {
				var options = args[1];

				expect(options).to.contain.keys(['out']);
				expect(options.out).to.equal(process.cwd());
			});
	});
});
