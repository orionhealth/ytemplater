/* jshint expr:true */

var expect = require('chai').expect,
	stream = require('stream'),
	testUtil = require('./test-util'),

	Engines = require('../lib/engines'),
	readTemplateFiles = require('../lib/read-template-files');

describe('readTemplateFiles()', function() {
	var engineIds = Object.keys(Engines);

	it('should return a stream for reading template file contents', function() {
		expect(readTemplateFiles()).to.be.an.instanceOf(stream);
	});

	engineIds.forEach(function(engineId) {
		function expectTemplateDataToMatchTemplateWithName(templateData, templateName) {
			expect(templateData.name).to.equal(templateName);
			expect(templateData.engineId).to.equal(engineId);
			expect(templateData.template).to.equal(testUtil.getTestTemplate(templateName, engineId));
		}

		it('should read a ' + engineId + ' template file\'s contents and determine template name and engineId', function(done) {
			var readFilesStream = readTemplateFiles(),
				promise = testUtil.streamToPromise(readFilesStream),
				templateName = 'food';

			readFilesStream.write(testUtil.getTestTemplateFilePath(templateName, engineId));
			readFilesStream.end();

			promise.done(function(data) {
				// Ensure the empty call to readFilesStream.end() doesn't create an empty/null/etc template
				expect(data).to.have.length(1);

				expectTemplateDataToMatchTemplateWithName(data[0], templateName);

				done();
			});
		});

		it('should stream multiple ' + engineId + ' template files', function(done) {
			var readFilesStream = readTemplateFiles(),
				promise = testUtil.streamToPromise(readFilesStream),
				templateNames = ['food', 'name'];

			readFilesStream.write(testUtil.getTestTemplateFilePath(templateNames[0], engineId));
			readFilesStream.write(testUtil.getTestTemplateFilePath(templateNames[1], engineId));
			readFilesStream.end();

			promise.done(function(data) {
				expect(data).to.have.length(2);
				expectTemplateDataToMatchTemplateWithName(data[0], templateNames[0]);
				expectTemplateDataToMatchTemplateWithName(data[1], templateNames[1]);

				done();
			});
		});
	});

	it('should emit an error event if an error is encountered reading the file', function(done) {
		var readFilesStream = readTemplateFiles(),
			errorThrown = false;

		readFilesStream.on('error', function() {
			errorThrown = true;
		});

		readFilesStream.write('this_template_file_does_not_exist.micro');

		setTimeout(function() {
			expect(errorThrown).to.be.true;
			done();
		}, 10);
	});

	it('should emit an error event for a file with an unknown extension', function(done) {
		var readFilesStream = readTemplateFiles(),
			errorThrown = false;

		readFilesStream.on('error', function(error) {
			expect(error).to.be.an.instanceOf(Error);
			expect(error.message).to.equal('Unrecognized template file with extension "txt"');

			errorThrown = true;
		});

		readFilesStream.write(testUtil.getTestTemplateFilePath('not-a-template', 'txt'));

		setTimeout(function() {
			expect(errorThrown).to.be.true;
			done();
		}, 10);
	});

	it('should stream multiple template files of different types', function(done) {
		var readFilesStream = readTemplateFiles(),
			promise = testUtil.streamToPromise(readFilesStream),
			templates = [{
				name: 'food',
				engineId: 'handlebars'
			}, {
				name: 'name',
				engineId: 'micro'
			}];

		function expectTemplateDataToMatchTemplateWithName(templateData, templateInfo) {
			expect(templateData.name).to.equal(templateInfo.name);
			expect(templateData.engineId).to.equal(templateInfo.engineId);
			expect(templateData.template).to.equal(testUtil.getTestTemplate(templateInfo.name, templateInfo.engineId));
		}

		readFilesStream.write(testUtil.getTestTemplateFilePath(templates[0].name, templates[0].engineId));
		readFilesStream.write(testUtil.getTestTemplateFilePath(templates[1].name, templates[1].engineId));
		readFilesStream.end();

		promise.done(function(data) {
			expect(data).to.have.length(2);
			expectTemplateDataToMatchTemplateWithName(data[0], templates[0]);
			expectTemplateDataToMatchTemplateWithName(data[1], templates[1]);

			done();
		});
	});
});
