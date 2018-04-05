'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util');

gulp.task('sass', function() {
    gulp.src('scss/index.scss')
        .pipe(sass({style: 'compressed'}))
        .on('error', gutil.log)
        .pipe(gulp.dest('css/'))
});

gulp.task('sass:watch', function () {
    gulp.watch('scss/**', ['sass']);
});