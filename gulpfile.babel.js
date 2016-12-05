'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import webpackStream  from 'webpack-stream';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';

gulp.task('build', ['copy-assets','build-sass','build-client', 'build-server']);

gulp.task('build-client', ['concat-vendor'], () =>
    gulp.src('src/js/client/app.js')
        .pipe(webpackStream(require('./webpack.config.js')))
        .pipe(gulp.dest('public/build/js/'))
);

gulp.task('build-server', [], () =>
    gulp.src(['src/js/server/server.js'])
    .pipe(babel())
    .pipe(gulp.dest('server/'))
);

gulp.task('build-shared', () =>
    gulp.src(['src/shared/**/*.*'])
        .pipe(babel())
        .pipe(gulp.dest('public/build/js/shared/'))
);

gulp.task('watch', ['build'], () => {
    gulp.watch(['src/scss/**/*.*'], ['build-sass']);
    gulp.watch(['src/js/client/**/*.*'], ['build-client']);
    gulp.watch(['src/js/server/**/*.*'], ['build-server']);
    gulp.watch(['src/js/shared/**/*.*'], ['build-server', 'build-client']);
    gulp.watch(['src/assets/**/*.*'], ['copy-assets']);
    gulp.start('run');
});


gulp.task('concat-vendor', () =>
    gulp.src(['src/js/client/vendor/**/*.*'])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('public/build/js/'))
);


gulp.task('copy-assets', () =>
    gulp.src(['src/assets/**/*.*'])
    .pipe(gulp.dest('public/assets/'))
);


gulp.task('build-sass', function () {
    gulp.src('src/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/build/css'));
});


gulp.task('run', () => {
    nodemon({
        delay: 10,
        script: 'server/server.js',
        // args: ["config.json"],
        ext: 'js',
        watch: 'src'
    })
});

gulp.task('default', ['build', 'run']);
