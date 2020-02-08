const babel = require('gulp-babel')
const del = require('del')
const gulp = require('gulp')
const uglify = require('gulp-uglify')
const browserSync = require('browser-sync')
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass');
const enviroinments = require('gulp-environments');

const server = browserSync.create();
const production = enviroinments.production;
const development = enviroinments.development;

const paths = {
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/scripts/'
  },
  styles: {
	  src: 'src/scss/**/*.scss',
	  dest: 'dist/styles/'
  },
  html: {
	  src: 'src/index.html',
	  dest: 'dist/'
  }
};

function clean() {
  return del(['dist']);
}

function html() {
  return gulp
    .src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest));
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(development(sourcemaps.init({loadMaps: true})))
    .pipe(babel())
    .pipe(production(uglify()))
    .pipe(development(sourcemaps.write('.')))
    .pipe(gulp.dest(paths.scripts.dest));
}

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(development(sourcemaps.init({loadMaps: true})))
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(postcss(
      production() ? [autoprefixer(), cssnano()] : [autoprefixer()]
    ))
    .pipe(development(sourcemaps.write('.')))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(server.stream())
}


function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: './dist/'
    }
  });
  done();
}

function watch(done) {
  gulp.watch(paths.html.src, gulp.series(html, reload));
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload));
  gulp.watch(paths.styles.src, gulp.series(styles));
  done();
}

const dev = gulp.series(clean, html, scripts, styles, serve, watch);
const build = gulp.series(clean, html, scripts, styles);

exports.dev = dev;
exports.build = build;
exports.default = dev;