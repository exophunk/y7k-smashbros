var Elixir = require('laravel-elixir');
var config = require('./config');

var gulp = require('gulp');
var babel = require('gulp-babel');
var nodemon = require('gulp-nodemon');

require('laravel-elixir-vue-2');
require('laravel-elixir-eslint');
require('laravel-elixir-imagemin');


Elixir(function (mix) {

    mix

        // Minify images
        //.imagemin()

        // Build CSS
        .sass('main.scss')
        // .sass('vendor.scss')

        // Lint code for errors
        .eslint(config.eslint.paths)

        // Build Javascript with Webpack
        .webpack('client/app.js')

        .rollup('server/server.js','server/server.js')

        // Concatenate all js FILES inside "js/vendor/" - including files in  subfolders - to "build/js/vendor.js"
        .scriptsIn(config.vendorjs.assets.folder, config.vendorjs.build.file)

        // Concatenate all js files inside "js/vendor/" - excluding its subfolders - to "build/js/vendor.js"
        // .scripts(config.vendorjs.assets.folder + '/*.js', config.vendorjs.build.file)

        // Copy any FOLDER inside "js/vendor/" to "build/js/vendor" untouched (for separate, single script import)
        // .copy(config.vendorjs.assets.folder + '/*', config.vendorjs.build.folder)

        // Version Files
        // .version(['css/main.css', 'js/app.js'])

        // Start browsersync if appliable
        .browserSync(config.browserSync);

});




gulp.task('build-server', () =>
    gulp.src(['resources/assets/js/server/server.js'])
    .pipe(babel())
    .pipe(gulp.dest('server'))
);



gulp.task('server', ['build-server'], () => {
    nodemon({
        delay: 10,
        script: 'server/server.js',
    })
});

