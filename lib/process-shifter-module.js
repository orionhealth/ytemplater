var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	Q = require('q'),

	readFile = Q.nfbind(fs.readFile),

	JS_EXT = '.js',
	JS_FOLDER = 'js',
	TEMPLATES_FOLDER = 'templates';

function readBuildJson(moduleDir) {
	return readFile(path.join(moduleDir, 'build.json'), { encoding: 'utf8' }).then(JSON.parse);
}

function hasTemplateFiles(templateBuild) {
	return templateBuild && templateBuild.files.length;
}

function processShifterModule(moduleDir) {

	function getTemplateFilename(templateFilename) {
		return path.join(moduleDir, TEMPLATES_FOLDER, templateFilename);
	}

	function getTemplateBuildData(templateModuleData, templateModuleName) {
		return {
			files: _.map(templateModuleData.templateFiles, getTemplateFilename),
			options: {
				out: path.join(moduleDir, JS_FOLDER),
				moduleName: templateModuleName
			}
		};
	}

	function processBuildJson(buildJson) {
		var templateConfig = buildJson.ytemplater;

		if (!templateConfig || !Object.keys(templateConfig).length) {
			return [];
		}

		return _.chain(templateConfig)
				.map(getTemplateBuildData)
				.filter(hasTemplateFiles)
				.value();
	}

	return readBuildJson(moduleDir).then(processBuildJson);
}

exports = module.exports = processShifterModule;
