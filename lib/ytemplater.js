var fs = require('fs'),
	path = require('path'),
	Q = require('q'),
	through = require('through'),

	precompiler = require('./precompiler');

function precompile(files, options) {
	var deferred = Q.defer(),
		stream = precompiler.precompile(files),
		outputDir = options && options.out || process.cwd();

	stream.on('error', deferred.reject.bind(deferred));

	stream
		.pipe(through(null, end))
		.pipe(fs.createWriteStream(path.join(outputDir, 'templates.js')));

	function end() {
		this.queue(null);
		deferred.resolve();
	}

	return deferred.promise;
}
exports.precompile = precompile;
