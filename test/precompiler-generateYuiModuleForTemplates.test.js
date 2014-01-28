var expect = require('chai').expect,
	stream = require('stream'),
	PrecompilerTest = require('./precompiler-test');

PrecompilerTest(function(testUtil) {
	var precompiler = testUtil.precompiler;

	describe('generateYuiModuleForTemplates()', function() {
		// TODO

		it('should return a stream for generating a YUI module for precompiled templates', function() {
			expect(precompiler.generateYuiModuleForTemplates({ dependencies: [] })).to.be.an.instanceOf(stream);
		});

	});
});
