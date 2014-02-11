var fs = require('fs'),
	mapStream = require('map-stream'),
	path = require('path'),

	Engines = require('./engines');

// templateFilePath = {String} path to template file
function readTemplateFiles() {
	return mapStream(function(templateFilePath, callback) {
		fs.readFile(templateFilePath, { encoding: 'utf8' }, function(err, template) {
			if (err) {
				return callback(err);
			}

			var extension = path.extname(templateFilePath),
				engineId = extension.substring(1);

			if (!Engines[engineId]) {
				return callback(new Error('Unrecognized template file with extension "' + engineId + '"'));
			}

			callback(null, {
				name: path.basename(templateFilePath, extension),
				engineId: engineId,
				template: template
			});
		});
	});
}
exports = module.exports = readTemplateFiles;
