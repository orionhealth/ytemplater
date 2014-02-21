var growl = require('growl'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint-cached'),
	mocha = require('gulp-mocha'),
	through = require('through'),

	paths = {
		scripts: './lib/*.js',
		tests: './test/*.test.js'
	};

// Require the test setup module as the --require option can only be used via commandline execution of mocha
require('./test/setup.js');

function test(notifyOnFail) {
	var stream = gulp.src(paths.tests, { read: false })
		.pipe(mocha({
			reporter: 'nyan'
		}));

	if (notifyOnFail) {
		stream.on('error', function() {
			growl('Tests failed!', { name: 'Mocha' });
		});
	}

	return stream;
}

function notifyOnJshintFail() {
	var failDetected = false;

	return through(function write(file) {
			if (!file.jshint.success) {
				failDetected = true;
			}
			this.queue(file);
		}, function end() {
			if (failDetected) {
				growl('JSHint failed!', { name: 'JSHint' });
			}
			this.queue(null);
		});
}

gulp.task('lint', function() {
	return gulp.src([paths.scripts, paths.tests])
		.pipe(jshint.cached())
		.pipe(notifyOnJshintFail())
		.pipe(jshint.reporter('default'));
});

gulp.task('test', function() {
	return test();
});

gulp.task('on-watch', ['lint'], function() {
	// Don't return, otherwise failed tests will kill the watch
	test(true);
});

gulp.task('default', ['on-watch'], function() {
	gulp.watch('{lib,test}/*', ['on-watch']);
});
