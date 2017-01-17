'use strict'

import gulp from 'gulp'
import sass from 'gulp-sass'
import concat from 'gulp-concat'
import sourcemaps from 'gulp-sourcemaps'
import webpackStream  from 'webpack-stream'
import nodemon from 'gulp-nodemon'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'

let production = false


gulp.task('build-dev', () => {
    production = false
    gulp.start('build-client')
    gulp.start('build-server')
})

gulp.task('build-prod', () => {
    production = true
    gulp.start('build-client')
    gulp.start('build-server')
})

gulp.task('build-client', ['prepare-build'], () => {
    let webpackConfig = production ? require('./webpack.client.production.config.js') : require('./webpack.client.config.js')
    webpackConfig.watch = false
    gulp.src('src/js/client/app.js')
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest('public/build/js/'))
})


gulp.task('build-server', ['copy-admin-templates'], () =>
    gulp.src('src/js/server/server.js')
        .pipe(webpackStream(require('./webpack.server.config.js')))
        .pipe(gulp.dest('server/'))
)





gulp.task('copy-assets', () =>
    gulp.src(['src/assets/**/*.*'])
    .pipe(gulp.dest('public/build/assets'))
)

gulp.task('copy-admin-templates', () =>
    gulp.src(['src/views/admin/**/*.*'])
    .pipe(gulp.dest('server/admin/views'))
)

gulp.task('concat-vendor', () => {

    if(production) {
        gulp.src(['src/js/libs/**/*.*'])
            .pipe(concat('libs.js'))
            .pipe(uglify())
            .pipe(gulp.dest('public/build/js/'))
    } else {
        gulp.src(['src/js/libs/**/*.*'])
            .pipe(sourcemaps.init())
            .pipe(concat('libs.js'))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('public/build/js/'))

    }


})



gulp.task('build-sass', function () {
    gulp.src('src/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/build/css'))

    gulp.src('src/scss/admin.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/build/css'))
})


gulp.task('run-server', () => {
    nodemon({
        delay: 10,
        script: 'server/server.js',
        ext: 'js',
        watch: 'server'
    })
})


gulp.task('prepare-build', ['concat-vendor', 'copy-assets', 'build-sass', 'build-server'], () => {

})

gulp.task('watch', ['prepare-build'], () => {
    gulp.watch(['src/scss/**/*.*'], ['build-sass'])
    gulp.watch(['src/assets/**/*.*'], ['copy-assets'])
    gulp.watch(['src/js/server/**/*'], ['build-server'])
    gulp.watch(['src/views/**/*.*'], ['copy-admin-templates'])
    gulp.start('run-server')

    let webpackConfig = require('./webpack.client.config.js')
    gulp.src('src/js/client/app.js')
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest('public/build/js/'))

})


gulp.task('default', ['build-prod'])
gulp.task('build', ['build-dev'])
