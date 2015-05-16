////
//// Usage: ./node_modules/.bin/gulp build, clean, test, etc.
////

var gulp = require('gulp');
var jsdoc = require('gulp-jsdoc');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var git = require('gulp-git');
var bump = require('gulp-bump');

var paths = {
    tests: ['tests/*.test.js', 'tests/*.tests.js'],
    docable: ['lib/*.js']
};

// Browser runtime environment construction.
gulp.task('build', ['patch-bump', 'doc']);

gulp.task('patch-bump', function(){
    gulp.src('./package.json')
	.pipe(bump({type: 'patch'}))
	.pipe(gulp.dest('./'));
});

// Build docs directory with JSDoc.
gulp.task('doc', function() {
    gulp.src(paths.docable)
        .pipe(jsdoc('./doc'));
});

// Get rid of anything that is transient.
gulp.task('clean', function(cb) {
    del(['./doc/*', '!./doc/README.org']);
});

// Testing with mocha/chai.
gulp.task('test', function() {
    return gulp.src(paths.tests, { read: false }).pipe(mocha({
	reporter: 'spec',
	globals: {
	    // Use a different should.
	    should: require('chai').should()
	}
    }));
});

//gulp.task('release', ['build', 'publish-npm', 'git-commit', 'git-tag']);
gulp.task('release', ['build', 'publish-npm']);

// Needs to have ""
gulp.task('publish-npm', function() {
    var npm = require("npm");
    npm.load(function (er, npm) {
	// NPM
	npm.commands.publish();	
    });
});

gulp.task('git-commit', function(){
    console.log('TODO: WORK IN PROGRESS');
    // Make a note in the git repo.
    var pkg = require('./package.json');
    var pver = pkg.version;
    gulp.src('./*')
	.pipe(git.commit('Package/version tracking for go-exp/widget: ' + pver));
});

gulp.task('git-tag', function(){
    console.log('TODO: WORK IN PROGRESS');
    // Make a note in the git repo.
    var pkg = require('./package.json');
    var pver = pkg.version;
    git.tag('go-exp-widget-' + pver, 'version message', function (err){
	if(err) throw err;
    });
});

// The default task (called when you run `gulp` from cli)
//gulp.task('default', ['watch', 'scripts', 'images']);
gulp.task('default', function() {
    console.log("'allo 'allo!");
});
