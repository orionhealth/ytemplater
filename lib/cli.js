var fs = require('fs'),
	path = require('path'),

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

// TODO: mkdirp args.o
// TODO: support args.o being a file to write to

// TODO: how to get module information?

require('./precompiler')
	.precompile(args._)
	.pipe(fs.createWriteStream(path.join(args.o, 'templates.js')));

