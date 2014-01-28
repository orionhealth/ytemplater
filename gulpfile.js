var growl = require('growl'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint-cached'),
	map = require('map-stream'),
	mocha = require('gulp-spawn-mocha'),

	srcJsFiles = './lib/*.js',
	testJsFiles = './test/*.test.js',
	allJsFiles = [srcJsFiles, testJsFiles];

function test() {
	return gulp.src(testJsFiles, { read: false })
		.pipe(mocha({
			require: './test/setup.js',
			reporter: 'nyan'
		}));
}

function notifyTestsFailed() {
	growl('Tests failed!', { name: 'Mocha' });
}

function lintTestNotify() {
	gulp.run('lint');
	test().on('error', notifyTestsFailed);
}

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

gulp.task('default', function() {
	lintTestNotify();
	gulp.watch('{lib,test}/*', lintTestNotify);
});
