var yargs = require('yargs')
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

// TODO: gather filenames from args._ and pass to precompiler
