var gulp   = require('gulp');
var lambda = require('gulp-awslambda');
var zip    = require('gulp-zip');

var lambda_params = {

};

var opts = {
	region: 'us-east-1'
};

gulp.task('default', function() {
    return gulp.src(['*.js','node*/**', '!gulp*'])
        .pipe(zip('archive.zip'))
        .pipe(lambda('[your_lambda_function_name]', opts))
        .pipe(gulp.dest('.'));
});