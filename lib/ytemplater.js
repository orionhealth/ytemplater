var fs = require('fs'),
	path = require('path'),
	Q = require('q'),

	precompiler = require('./precompiler');

function precompile(files, options) {
	var deferred = Q.defer(),
		stream = precompiler.precompile(files),
		outputDir = options && options.out || process.cwd();

	stream.on('end', deferred.resolve.bind(deferred));
	stream.on('error', deferred.reject.bind(deferred));

	stream.pipe(fs.createWriteStream(path.join(outputDir, 'templates.js')));

	return deferred.promise;
}
exports.precompile = precompile;
