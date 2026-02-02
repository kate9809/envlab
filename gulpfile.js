const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer').default;
const image = require('gulp-image').default;
const del = require('del');

//Images

function images() {
  return src('source/images/**/*')
    .pipe(image({
      pngquant: true,
      optipng: false,
      zopflipng: true,
      jpegRecompress: false,
      gifsicle: true,
      svgo: true,
      concurrent: 10,
      quiet: true
    }))
    .pipe(dest('build'));
}

//js

const scripts = () => {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'source/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('build/js'))
    .pipe(browserSync.stream());
};

//Server

const browsersync = () => {
  browserSync.init({
    server: {
      baseDir: 'source/'
    },
  });
}

//Styles

function styles() {
  return src('source/scss/style.scss')
    .pipe(scss({ style: 'compressed' }).on('error', scss.logError))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true
    }))
    .pipe(dest('source/css'))
    .pipe(browserSync.stream())
}

//Watcher

function watcher() {
  watch('source/scss/**/*.scss', series(styles));
  watch('source/js/**/!(*.min).js', scripts);  // исключили *.min.js
  watch('source/**/*.html').on('change', () => browserSync.reload());
}

//Build

function buildStyles() {
  return src('source/css/style.min.css', { base: 'source' })
    .pipe(dest('build'));
}

function buildHtml() {
  return src('source/*.html', { base: 'source' })
    .pipe(dest('build'));
}

function buildFonts() {
  return src('source/fonts/**/*.{woff,woff2}', {
    base: 'source',
    encoding: false,
    buffer: true
  })
    .pipe(dest('build'));
}

//Clean

function cleanbuild() {
  return del('build'); // del() возвращает Promise, Gulp дождётся
}

function openBrowser() {
  browserSync.init({
    server: {
      baseDir: 'build/'
    },
    open: true,
    notify: false
  });
}

exports.styles = styles;
exports.watcher = watcher;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanbuild = cleanbuild;

exports.build = series(
  images,
  parallel(
    buildStyles,
    buildHtml,
    buildFonts
  ),
  openBrowser
);

exports.default = parallel(styles, scripts, browsersync, watcher);
