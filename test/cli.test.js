var _ = require('lodash'),
	cliSpy = require('cli-spy'),
	expect = require('chai').expect,
	path = require('path'),
	Q = require('q'),

	mkdirp = Q.nfbind(require('mkdirp')),
	rimraf = Q.nfbind(require('rimraf')),
	writeFile = Q.nfbind(require('fs').writeFile),

	testUtil = require('./test-util');

describe('ytemplater CLI', function() {
	var cli = cliSpy('./lib/cli', function() {
			var Q = require('q'),
				ytemplater = require('./lib/ytemplater');
			// stub the precompile & precompileShifterModule methods to print the passed args to stdout so the test can inspect them
			ytemplater.precompile = function() {
				/*__spy__*/
				return Q();
			};
			ytemplater.precompileShifterModule = function() {
				/*__spy__*/
				return Q();
			};
		}),
		testDir = path.join(__dirname, '___test___'),
		templatesDir = path.join(testDir, 'templates'),
		templateFiles = ['name.handlebars', 'food.handlebars'];

	function cleanTestDir() {
		return rimraf(testDir);
	}

	function createTestFiles() {
		return cleanTestDir()
			.then(function() {
				return mkdirp(templatesDir);
			})
			.then(function() {
				return Q.all(_.map(templateFiles, function(filename) {
					return writeFile(path.join(templatesDir, filename), '');
				}));
			});
	}

	afterEach(cleanTestDir);

	it('should expand globs to the list of applicable files', function() {
		return createTestFiles()
			.then(function() {
				return cli.exec(path.join(templatesDir, '*.handlebars'));
			})
			.then(function(cliInfo) {
				var files = cliInfo.executions[0].args[0];

				expect(cliInfo.executions).to.have.length(1);

				expect(files).to.be.a('array');
				expect(files).to.have.length(2);

				templateFiles.forEach(function(templateFile) {
					expect(files).to.contain(path.join(templatesDir, templateFile));
				});
			});
	});

	it('should pass the output directory specified via --out', function() {
		var outputDir = 'test-output-dir';
		return cli.exec('*.micro --out ' + outputDir)
			.then(function(cliInfo) {
				expect(cliInfo.executions).to.have.length(1);
				expect(cliInfo.executions[0].args[1]).to.have.property('out', outputDir);
			});
	});

	it('should pass the output directory specified via -o', function() {
		var outputDir = 'test-output-dir';
		return cli.exec('*.micro -o ' + outputDir)
			.then(function(cliInfo) {
				expect(cliInfo.executions).to.have.length(1);
				expect(cliInfo.executions[0].args[1]).to.have.property('out', outputDir);
			});
	});

	it('should default the output directory to the cwd', function() {
		return cli.exec('*.micro')
			.then(function(cliInfo) {
				expect(cliInfo.executions).to.have.length(1);
				expect(cliInfo.executions[0].args[1]).to.have.property('out', process.cwd());
			});
	});

	it('should pass the `moduleName` when specified via -m', function() {
		var expectedModuleName = 'my-test-module';
		return cli.exec('*.micro -m ' + expectedModuleName)
			.then(function(cliInfo) {
				expect(cliInfo.executions).to.have.length(1);
				expect(cliInfo.executions[0].args[1]).to.have.property('moduleName', expectedModuleName);
			});
	});

	it('should pass the `moduleName` when specified via --module-name', function() {
		var expectedModuleName = 'my-test-module';
		return cli.exec('*.micro --module-name ' + expectedModuleName)
			.then(function(cliInfo) {
				expect(cliInfo.executions).to.have.length(1);
				expect(cliInfo.executions[0].args[1]).to.have.property('moduleName', expectedModuleName);
			});
	});

	it('should call precompileShifterModule once for each directory specified when set to shifter module mode via -s', function() {
		var dirs = ['dir1', 'dir2'];
		return cli.exec(dirs[0] + ' -s ' + dirs[1]) // Ensure order of dirs/flags doesn't matter
			.then(function(cliInfo) {
				var executions = cliInfo.executions;

				expect(executions).to.have.length(dirs.length);

				dirs.forEach(function(dir, index) {
					var args = executions[index].args;

					expect(args).to.have.length(1);
					expect(args[0]).to.equal(dir);
				});
			});
	});

	it('should call precompileShifterModule once for each directory specified when set to shifter module mode via --shifter', function() {
		var dirs = ['dir1', 'dir2'];
		return cli.exec(dirs[0] + ' --shifter ' + dirs[1]) // Ensure order of dirs/flags doesn't matter
			.then(function(cliInfo) {
				var executions = cliInfo.executions;

				expect(executions).to.have.length(dirs.length);

				dirs.forEach(function(dir, index) {
					var args = executions[index].args;

					expect(args).to.have.length(1);
					expect(args[0]).to.equal(dir);
				});
			});
	});
});
