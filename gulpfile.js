const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const del = require('del');
const config = require('./gulp.config')();
const runSequence = require('run-sequence');
var jasmine = require('gulp-jasmine');
var istanbul = require('gulp-istanbul');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
var tslint = require("gulp-tslint");
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');

gulp.task('lint', function () {
    return gulp.src(config.srcFiles)
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report());
});

gulp.task('clean', function (callback) {
    return del([config.build.buildDirectory, config.test.coverageDirectory], callback);
});

gulp.task('build', function (done) {
    runSequence('clean', 'lint', 'transpile', function () {
        done();
    })
});

gulp.task("transpile", function () {
    const tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult
        .pipe(sourcemaps.write('',{
            sourceRoot:  path.join(__dirname, 'src')
        }))
        .pipe(gulp.dest(config.build.buildDirectory));
});

gulp.task('pre-test', function () {
    return gulp.src([config.build.buildDirectory + '**/!(*.spec).js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('test', function () {
    runSequence('build', 'pre-test', function () {
        return gulp.src([config.build.buildDirectory + '**/*spec.js'])
            .pipe(jasmine({
                reporter: ['list', new SpecReporter({
                    spec: {
                        displayPending: true
                    }
                }
                )], timeout: 3000
            }))
            .pipe(istanbul.writeReports())
            .pipe(istanbul.enforceThresholds({ thresholds: { global: config.coverageThreshold } }));
    });
});
