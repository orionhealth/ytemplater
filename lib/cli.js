var optimist = require('optimist'),

	options = optimist
		.usage('Usage: $0 [options] files...')
		.options('h', {
			alias: 'help',
			describe: 'Show this usage information'
		}),

	args = options.argv;

if (args.h) {
	options.showHelp(console.log);
	return;
}

// TODO: gather filenames from args._ and pass to precompiler
