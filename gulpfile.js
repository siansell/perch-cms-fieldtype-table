/* eslint-disable no-console */
const gulp = require('gulp')

gulp.task('handsontable', () => {
  gulp.src([
    './node_modules/handsontable/dist/handsontable.full.min.js',
    './node_modules/numbro/dist/languages.min.js',
  ])
    .pipe(gulp.dest('./simona_table/js'))

  gulp.src([
    './node_modules/handsontable/dist/handsontable.full.min.css',
  ])
    .pipe(gulp.dest('./simona_table/css'))
})

gulp.task('build', [
  'handsontable',
])
