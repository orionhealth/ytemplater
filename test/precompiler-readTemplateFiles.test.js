var expect = require('chai').expect,
	stream = require('stream'),
	PrecompilerTest = require('./precompiler-test');

PrecompilerTest(function(testUtil) {
	var precompiler = testUtil.precompiler;

	describe('readTemplateFiles()', function() {
		it('should return a stream for reading template file contents', function() {
			expect(precompiler.readTemplateFiles()).to.be.an.instanceOf(stream);
		});

		function expectTemplateDataToMatchTemplateWithName(templateData, templateName) {
			expect(templateData.name).to.equal(templateName);
			expect(templateData.template).to.equal(testUtil.getTestTemplate(templateName));
		}

		it('should read a template file\'s contents and determine template name from filename', function(done) {
			var readFilesStream = precompiler.readTemplateFiles(),
				promise = testUtil.streamToPromise(readFilesStream),
				templateName = 'food';

			readFilesStream.write(testUtil.getTestTemplateFilePath(templateName));
			readFilesStream.end();

			promise.done(function(data) {
				// Ensure the empty call to readFilesStream.end() doesn't create an empty/null/etc template
				expect(data).to.have.length(1);

				expectTemplateDataToMatchTemplateWithName(data[0], templateName);

				done();
			});
		});

		it('should stream multiple template files', function(done) {
			var readFilesStream = precompiler.readTemplateFiles(),
				promise = testUtil.streamToPromise(readFilesStream),
				templateNames = ['food', 'name'];

			readFilesStream.write(testUtil.getTestTemplateFilePath(templateNames[0]));
			readFilesStream.write(testUtil.getTestTemplateFilePath(templateNames[1]));
			readFilesStream.end();

			promise.done(function(data) {
				expect(data).to.have.length(2);
				expectTemplateDataToMatchTemplateWithName(data[0], templateNames[0]);
				expectTemplateDataToMatchTemplateWithName(data[1], templateNames[1]);

				done();
			});
		});
	});
});
