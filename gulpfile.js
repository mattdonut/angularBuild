var gulp = require('gulp');
var clean = require('gulp-clean');
var inject = require('gulp-inject');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var es = require('event-stream');
var bowerFiles = require('gulp-bower-files');
var liveReload = require('gulp-livereload');
var angularFilesort = require('gulp-angular-filesort');

// These are useful paths in our code repo for src and build directories.
var projectPath = '.';
var codeSrc = projectPath + '/src';
var appSrc = codeSrc + '/app';
var styleSrc = codeSrc + '/style';
var buildPath = projectPath + '/build';
var buildLib = buildPath + '/libs';
var appBuild = buildPath + '/app';
var styleBuild = buildPath + '/style';

// These are globs targeting source and build files.
var styleSrcGlob = [styleSrc + '/**/*.sass', styleSrc + '/**/*.scss'];
var coffeeSrcGlob = appSrc + '/**/*.coffee';
var appBuildGlob = appBuild + '/**/*.js';
var styleBuildGlob = styleBuild + '/**/*.css';
var templatesSrcGlob = appSrc + '/**/*.html';

// A helper to build, concatenate, minify, and move scripts.
var buildCatCoffee = function () {
    return gulp.src(coffeeSrcGlob)
        .pipe(coffee({bare:true}))
        .pipe(angularFilesort())
        .pipe(concat('app.js'))
        // .pipe(uglify({mangle:true}))
        .pipe(gulp.dest(appBuild));
};

// A helper to build, concatenate, and move style sheets.
var buildCatStyle = function () {
    return gulp.src('./src/style/app.scss')
        .pipe(sass())
        .pipe(concat('app.css'))
        .pipe(gulp.dest(styleBuild));
};

// What follows are subtasks.

// A task to wipe out all build artifacts in the build directory.
gulp.task('clean-build', function() {
    return gulp.src(buildPath + '/**/*')
        .pipe(clean());
});

// A task to build and cat the scripts.
gulp.task('build-cat-coffee', function() {
    return buildCatCoffee();
});
// A task that build-cats the script files, and runs a livereload server for changes.
gulp.task('build-cat-coffee-lr', function() {
    return buildCatCoffee().pipe(liveReload());
});

// A task to build and cat style files.
gulp.task('build-cat-style', function() {
    return buildCatStyle();
});
// A task to build and cat style files, and runs a livereload server for changes.
gulp.task('build-cat-style-lr', function() {
    return buildCatStyle().pipe(liveReload());
});

// A combo task, build-cats scripts and styles.
gulp.task('build-cat-all', ['build-cat-coffee', 'build-cat-style']);

// A task to copy html templates from src to build.
gulp.task('build-copy-html', function() {
    return gulp.src(templatesSrcGlob)
        .pipe(gulp.dest(appBuild));
});

gulp.task('build-copy-html-lr', function() {
    return gulp.src(templatesSrcGlob)
        .pipe(gulp.dest(appBuild))
        .pipe(liveReload());
});

// A task to build-cat-all and then insert the results into the main app.html template.
gulp.task('build-cat-insert', ['build-cat-all'], function() {
    return gulp.src(codeSrc + '/app.html')
        .pipe(inject(
            es.merge(
                // This merge is here so that other non-bower files can be included in the
                // libraries to be copied into the serving location.
                // An example of how that might look follows:
                // gulp.src(staticBase+'/lib/**/*.js'),
                // gulp.src([staticBase + '/lib/**/*.js', staticBase + '/lib/**/*.css']),
                bowerFiles().pipe(gulp.dest(buildLib))
            ),
            {
                starttag: '<!-- inject:head:{{ext}} -->',
                 ignorePath: '/build'
            }
        ))
        .pipe(inject(
            gulp.src([appBuild + '/**/*.js', styleBuild + '/**/*.css']),
            {ignorePath: '/build'}
        ))
        .pipe(gulp.dest(buildPath));
});

// What follows are Main Tasks

// Register build-cat-insert as the default task for 'gulp'.
gulp.task('default', ['build-cat-insert', 'build-copy-html']);

// A task to run the main build and then watch the source files for changes
// NOTE (donut): Right now the watch triggers a full rebuild of each source type.
// Since the build tasks take around 200ms to run, this is fine for now.
gulp.task('watcher', ['build-cat-insert', 'build-copy-html-lr', 'build-cat-coffee-lr', 'build-cat-style-lr'], function (){
    gulp.watch(coffeeSrcGlob, ['build-cat-coffee-lr']);
    gulp.watch(styleSrcGlob, ['build-cat-style-lr']);
    gulp.watch(templatesSrcGlob, ['build-copy-html-lr']);
});
