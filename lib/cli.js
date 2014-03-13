var fs = require('fs'),
	path = require('path'),

	TS_PRECOMPILE_TEMPLATES = 'Precompile templates',

	yargs = require('yargs')
		.usage('Usage: $0 [options] files...')
		.options('o', {
			alias: 'out',
			describe: 'File or directory to write the precompiled templates to',
			default: process.cwd()
		})
		.options('h', {
			alias: 'help',
			describe: 'Show this usage information'
		}),

	args = yargs.argv;

if (args.h) {
	yargs.showHelp(console.log);
	return;
}

if (args._.length === 0) {
	yargs.showHelp(console.error);
	console.error('At least one file is required.');
	process.exit(1);
}

// TODO: moduleName arg
// TODO: how to get module information?

console.time(TS_PRECOMPILE_TEMPLATES);

require('./ytemplater')
	.precompile(args._, args)
	.done(function() {
		console.timeEnd(TS_PRECOMPILE_TEMPLATES);
	});

