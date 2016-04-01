const gulp = require('gulp');

const del = require('del');
const fs = require('fs');
const path = require('path');
const connect = require('gulp-connect');
const exec = require('child_process').exec;
const runSequence = require('run-sequence');
const cachebust = new require('gulp-cachebust')();

const port = 8080;

const hugoConfig = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

const activeTheme = hugoConfig.theme;

const distPath = __dirname + '/public';
const themesPath = __dirname + '/themes/';
const watchOptions = {interval: 1000, mode: 'poll'};

function getThemesFolders(dir) {
  return fs.readdirSync(dir)
  .filter((file) => {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

const toClean = [];
const toWatch = {};

getThemesFolders(themesPath).forEach((theme) => {
  const themeBuilder = require(path.join(themesPath, theme, 'gulpfile.babel.js'));
  const themeDir = path.join(themesPath, theme);

  //declare tasks for theme
  for (const i in themeBuilder.clean) {
    toClean.push(path.join(themeDir,themeBuilder.clean[i]));
  }
  gulp.task(theme + '-deps', themeBuilder.deps(themeDir));
  gulp.task(theme + '-js', themeBuilder.js(themeDir, cachebust));
  gulp.task(theme + '-js-dev', themeBuilder.jsDev(themeDir));
  gulp.task(theme + '-css', themeBuilder.css(themeDir, cachebust));
  gulp.task(theme + '-css-dev', themeBuilder.cssDev(themeDir));
  gulp.task(theme + '-css-dev-hugo-draft', (cb) => {
    runSequence(theme+'-css-dev', 'hugo-draft', cb);
  });
  gulp.task(theme + '-js-dev-hugo-draft', (cb) => {
    runSequence(theme+'-js-dev', 'hugo-draft', cb);
  });

  //setup watch for theme, if it is the active theme
  if (theme === activeTheme) {
    for (const j in themeBuilder.watchCSSSource) {
      toWatch[path.join(themeDir,themeBuilder.watchCSSSource[j])] = [theme+'-css-dev-hugo-draft'];
    }
    for (const k in themeBuilder.watchJSSource) {
      toWatch[path.join(themeDir,themeBuilder.watchJSSource[k])] = [theme+'-js-dev-hugo-draft'];
    }
    for (const l in themeBuilder.watchTheme) {
      toWatch[path.join(themeDir,themeBuilder.watchTheme[l])] = ['hugo-draft'];
    }
  }
});

gulp.task('clean-themes', () => {
  return del(toClean);
});

// clean dist folder
gulp.task('clean', ['clean-themes'], () => {
  return del([
    distPath
  ]);
});

// Hugo (without drafts)
gulp.task('hugo', [activeTheme+'-css', activeTheme+'-js'], (cb) => {
  exec('hugo --baseUrl="http://nomjs.com/"', (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

// Hugo (with drafts)
gulp.task('hugo-draft', (cb) => {
  exec('hugo --verbose -D --baseUrl=""', (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    gulp.src('public/').pipe(connect.reload());
    cb(err);
  });
});

// cachebust step
gulp.task('bust', ['hugo'], () => {
  return gulp.src('public/**/*.html')
    .pipe(cachebust.references())
    .pipe(gulp.dest('public'));
});

// server
gulp.task('connect', () => {
  connect.server({
    root: 'public',
    port: port,
    livereload: {
      port: 35729
    }
  });
});

// dist
gulp.task('dist', (cb) => {
  runSequence('clean', activeTheme+'-deps', 'bust', cb);
});

gulp.task('draft-dist', (cb) => {
  runSequence(
    'clean',
    activeTheme+'-deps',
    activeTheme+'-css-dev',
    activeTheme+'-js-dev',
    'hugo-draft',
    cb
  );
});

// watch
gulp.task('watch', () => {
  gulp.watch('content/**/*.md', watchOptions, ['hugo-draft']);
  gulp.watch('layouts/**/*.html', watchOptions, ['hugo-draft']);
  gulp.watch('static/**/*', watchOptions, ['hugo-draft']);
  gulp.watch('config.json', watchOptions, ['hugo-draft']);
  for (const w in toWatch) {
    gulp.watch(w, watchOptions, toWatch[w]);
  }
});

// default
gulp.task('serve', () => {
  runSequence(
    'clean',
    activeTheme+'-deps',
    activeTheme+'-css-dev',
    activeTheme+'-js-dev',
    'hugo-draft',
    ['connect','watch']
  );
});
gulp.task('default', ['serve']);
