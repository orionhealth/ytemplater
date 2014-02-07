var optimist = require('optimist'),

	options = optimist
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

	args = options.argv;

if (args.h) {
	options.showHelp(console.log);
	return;
}

if (args._.length === 0) {
	options.showHelp(console.error);
	console.error('At least one file is required.');
	process.exit(1);
}

// TODO: gather filenames from args._ and pass to precompiler
