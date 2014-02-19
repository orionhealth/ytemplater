var growl = require('growl'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint-cached'),
	map = require('map-stream'),
	mocha = require('gulp-mocha'),

	srcJsFiles = './lib/*.js',
	testJsFiles = './test/*.test.js',
	allJsFiles = [srcJsFiles, testJsFiles];

// Require the test setup module as the --require option can only be used via commandline execution of mocha
require('./test/setup.js');

function test() {
	return gulp.src(testJsFiles, { read: false })
		.pipe(mocha({
			reporter: 'nyan'
		}));
}

function notifyTestsFailed() {
	growl('Tests failed!', { name: 'Mocha' });
}

gulp.task('lint-test-notify', ['lint'], function() {
	test().on('error', notifyTestsFailed);
});

gulp.task('lint', function() {
	var failDetected = false;

	gulp.src(allJsFiles)
		.pipe(jshint.cached())
		.pipe(map(function(file, callback) {
			if (!file.jshint.success) {
				failDetected = true;
			}
			callback(null, file);
		}))
		.pipe(jshint.reporter('default'))
		.on('end', function() {
			if (failDetected) {
				growl('JSHint failed!', { name: 'JSHint' });
			}
		});
});

gulp.task('test', function() {
	return test()
		.on('error', function(error) {
			throw error;
		});
});

gulp.task('default', ['lint-test-notify'], function() {
	gulp.watch('{lib,test}/*', ['lint-test-notify']);
});
