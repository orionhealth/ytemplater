var expect = require('chai').expect,
	stream = require('stream'),
	PrecompilerTest = require('./precompiler-test');

PrecompilerTest(function(testUtil) {
	var precompiler = testUtil.precompiler;

	describe('precompile()', function() {
		// TODO

		it('should return a stream for precompiling template files into a single YUI module', function() {
			expect(precompiler.precompile({ dependencies: [] }, [])).to.be.an.instanceOf(stream);
		});

	});
});
