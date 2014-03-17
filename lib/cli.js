var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	Q = require('q'),

	ytemplater = require('./ytemplater'),

	TS_PRECOMPILE_TEMPLATES = 'Precompile templates',

	yargs = require('yargs')
		.usage(
			'Usage:\n\n' +
			' $0 [options] files...\n' +
			' $0 --shifter dirs...\n'
		)
		.options('o', {
			alias: 'out',
			describe: 'File or directory to write the precompiled templates to',
			default: process.cwd()
		})
		.options('m', {
			alias: 'module-name',
			describe: 'Used to determine the name of the file to write to when specifying a directory for -o'
		})
		.options('s', {
			alias: 'shifter',
			describe: 'Find and precompile templates in the given shifter module directories; all other options are ignored',
			boolean: true
		})
		.options('h', {
			alias: 'help',
			describe: 'Show this usage information',
			boolean: true
		}),

	args = yargs.argv;

if (args.help) {
	yargs.showHelp(console.log);
	return;
}

if (args._.length === 0) {
	yargs.showHelp(console.error);
	console.error('At least one ' + (args.shifter ? 'shifter module directory' : 'file') + ' is required.');
	process.exit(1);
}

function precompile() {
	return ytemplater.precompile(args._, {
		out: args.out,
		moduleName: args.m
	});
}

function precompileShifterModules() {
	return Q.all(_.map(args._, function(shifterModuleDir) {
		return ytemplater.precompileShifterModule(shifterModuleDir);
	}));
}

// TODO: how to get module information?

console.time(TS_PRECOMPILE_TEMPLATES);

(args.shifter ? precompileShifterModules() : precompile())
	.done(function() {
		console.timeEnd(TS_PRECOMPILE_TEMPLATES);
	});

