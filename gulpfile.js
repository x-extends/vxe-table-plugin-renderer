const gulp = require('gulp')
const del = require('del')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')
const prefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const ts = require('gulp-typescript')
const pack = require('./package.json')

const exportModuleName = 'VXETablePluginRenderer'

gulp.task('build_style', function () {
  return gulp.src('style.scss')
    .pipe(sass())
    .pipe(prefixer({
      borwsers: ['last 1 version', '> 1%', 'not ie <= 8'],
      cascade: true,
      remove: true
    }))
    .pipe(gulp.dest('dist'))
    .pipe(cleanCSS())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('build_commonjs', function () {
  return gulp.src(['test.ts', 'index.ts'])
    .pipe(sourcemaps.init())
    .pipe(ts({
      noImplicitAny: true
    }))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(rename({
      basename: 'index',
      extname: '.common.js'
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'))
})

gulp.task('build_umd', function () {
  return gulp.src(['test.ts', 'index.ts'])
    .pipe(ts({
      noImplicitAny: true
    }))
    .pipe(replace(`require("xe-utils/methods/xe-utils")`, `require("xe-utils")`))
    .pipe(babel({
      moduleId: pack.name,
      presets: ['@babel/env'],
      plugins: [['@babel/transform-modules-umd', {
        globals: {
          [pack.name]: exportModuleName,
          'xe-utils': 'XEUtils'
        },
        exactGlobals: true
      }]]
    }))
    .pipe(replace(`global.${exportModuleName} = mod.exports;`, `global.${exportModuleName} = mod.exports.default;`))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('clear', () => {
  return del([
    'dist/test.*'
  ])
})

gulp.task('build', gulp.series(gulp.parallel('build_commonjs', 'build_umd', 'build_style'), 'clear'))
