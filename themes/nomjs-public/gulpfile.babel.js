const gulp = require('gulp');

const Q = require('q');
const exec = require('child_process').exec;
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const path = require('path');
const autoprefixer = require('gulp-autoprefixer');

module.exports = {
  clean: [
    'static/css/*.css',
    'static/js/*.js',
    'src/vendor'
  ],

  deps: function(themeDir) {
    return () => {
      const deferred = Q.defer();
      exec('cd '+themeDir+' && bower --allow-root install', (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      });
      return deferred.promise;
    };
  },

  js: function(themeDir, cachebust) {
    return () => {
      return gulp.src([
        path.join(themeDir, 'src/vendor/bootstrap-sass/assets/javascripts/bootstrap.js'),
        path.join(themeDir, 'src/js/*.js')
      ])
      .pipe(concat('nomjs-public.js'))
      .pipe(uglify())
      .pipe(cachebust.resources())
      .pipe(gulp.dest(path.join(themeDir, 'static/js/')));
    };
  },

  jsDev: function(themeDir) {
    return () => {
      return gulp.src([
        path.join(themeDir, 'src/vendor/bootstrap-sass/assets/javascripts/bootstrap.js'),
        path.join(themeDir, 'src/js/*.js')
      ])
      .pipe(concat('nomjs-public.js'))
      .pipe(gulp.dest(path.join(themeDir, 'static/js/')));
    };
  },

  css: function(themeDir, cachebust) {
    return () => {
      return gulp.src(path.join(themeDir, 'src/scss/style.scss'))
        .pipe(sass({
          includePaths: require('node-bourbon').with(require('node-neat').includePaths),
          outputStyle: 'compressed'}
        ))
        .pipe(autoprefixer({
    			browsers: ['last 2 versions'],
    			cascade: false
    		}))
        .pipe(cachebust.resources())
        .pipe(gulp.dest(path.join(themeDir, 'static/css')));
    };
  },

  cssDev: function(themeDir) {
    return () => {
      return gulp.src(path.join(themeDir, 'src/scss/style.scss'))
        .pipe(sass({includePaths: require('node-bourbon').with(require('node-neat').includePaths)})
          .on('error', sass.logError))
        .pipe(gulp.dest(path.join(themeDir, 'static/css')));
    };
  },

  watchJSSource: [
    'src/js/*.js',
    'src/js/**/*.js'
  ],

  watchCSSSource: [
    'src/scss/*.scss',
    'src/scss/**/*.scss'
  ],

  watchTheme: [
    'static/css/**/*.css',
    'static/img/**/*',
    'archetypes/**/*.md',
    'layouts/**/*.html',
    'theme.toml'
  ]
};
