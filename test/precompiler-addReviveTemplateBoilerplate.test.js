var expect = require('chai').expect,
	stream = require('stream'),
	PrecompilerTest = require('./precompiler-test');

PrecompilerTest(function(testUtil) {
	var precompiler = testUtil.precompiler;

	describe('addReviveTemplateBoilerplate()', function() {
		// TODO

		it('should return a stream for wrapping precompiled templates in revive boilerplate code', function() {
			expect(precompiler.addReviveTemplateBoilerplate()).to.be.an.instanceOf(stream);
		});

	});
});
