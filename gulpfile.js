/* eslint-disable no-console */
const gulp = require('gulp')
const rename = require('gulp-rename')
const uglifyCss = require('gulp-uglifycss')
const uglifyJs = require('gulp-uglify')
const babel = require('gulp-babel')
const gutil = require('gulp-util')

const destinationDir = './simona_table'
const sourceDir = './src'

gulp.task('handsontable', () => {
  gulp.src([
    './node_modules/handsontable/dist/handsontable.full.min.js',
    './node_modules/numbro/dist/languages.min.js',
  ])
    .pipe(gulp.dest(`${destinationDir}/js`))

  gulp.src([
    './node_modules/handsontable/dist/handsontable.full.min.css',
  ])
    .pipe(gulp.dest(`${destinationDir}/css`))
})

gulp.task('css', () => {
  gulp.src([
    `${sourceDir}/**/*.css`,
  ])
    .pipe(uglifyCss({
      'maxLineLen': 80,
      'uglyComments': true,
    }))
    .on('error', gutil.log)
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${destinationDir}/css`))
})

gulp.task('js', () => {
  gulp.src([
    `${sourceDir}/**/*.js`,
  ])
    .pipe(babel({
      presets: ['babel-preset-env'].map(require.resolve),
    }))
    .on('error', gutil.log)
    .pipe(uglifyJs())
    .on('error', gutil.log)
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${destinationDir}/js`))
})

gulp.task('watchCss', () => {
  gulp.watch(`${sourceDir}/**/*.css`, ['css'])
})

gulp.task('watchJs', () => {
  gulp.watch(`${sourceDir}/**/*.js`, ['js'])
})

gulp.task('watch', [
  'watchCss',
  'watchJs',
])

gulp.task('build', [
  'handsontable',
  'css',
  'js',
])
