const {src, dest, watch, parallel, series} = require('gulp');
const scss = require('gulp-sass'); /* for scss*/
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default; /* for js, compress js*/
const autoprefixer = require('gulp-autoprefixer');
const imageMin = require('gulp-imagemin');
const mozJpeg = require('imagemin-mozjpeg');
const del = require('del');

function cleanDist () {
    return del('dist')
}

function startImages () {
    return src(['app/**/*.{gif,png,jpg,svg}'])
        .pipe(imageMin([
            imageMin.gifsicle({interlaced: true}),
            // mozJpeg({
            //     quality: 75,
            // }),
            imageMin.optipng({optimizationLevel: 5}),
            imageMin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function build () {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ],{base: 'app'}) /*full sent from app to dist(сортирует по папкам как в апп)*/
        .pipe(dest('dist')) /* upload from app to dist(выгружает с апп на дист)*/
}

function startScripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

/*Sync folder with directory in baseDir*/
function startBrowserSync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

/*Connect styles, styles folder, rename in style.min.css*/
function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'], /* follow 10 version browsers*/
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], startScripts);/*all js files but not main.min.js*/
    watch(['app/*.html']).on('change', browserSync.reload);
}

/* exports.nameForWriteInConsole = yourNameFanction *//*(console)gulp nameForWriteInConsole*/
exports.styles = styles;
exports.startWatch = watching;
exports.startBrowserSync = startBrowserSync;
exports.startScripts = startScripts;
exports.images = startImages;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, startImages, build);
exports.default = parallel(styles, startScripts, startBrowserSync, watching);