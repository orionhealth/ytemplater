var fs = require('fs'),
	path = require('path'),
	Q = require('q'),
	through = require('through'),

	mkdirp = Q.nfbind(require('mkdirp')),

	precompiler = require('./precompiler'),

	JS_EXT = '.js',
	DEFAULT_MODULE_NAME = 'templates';

function getOutputFile(options) {
	var out = options && options.out || process.cwd(),
		moduleName;

	if (path.extname(out) === JS_EXT) {
		return out;
	}

	moduleName = options && options.moduleName || DEFAULT_MODULE_NAME;
	return path.join(out, moduleName + JS_EXT);
}

function doPrecompile(files, outputFile) {
	var deferred = Q.defer(),
		stream = precompiler.precompile(files);

	stream.on('error', deferred.reject.bind(deferred));

	stream
		.pipe(through(null, end))
		.pipe(fs.createWriteStream(outputFile));

	function end() {
		this.queue(null);
		deferred.resolve();
	}

	return deferred.promise;
}

function precompile(files, options) {
	var outputFile = getOutputFile(options);

	return mkdirp(path.dirname(outputFile))
		.then(function() {
			return doPrecompile(files, outputFile);
		});
}
exports.precompile = precompile;
