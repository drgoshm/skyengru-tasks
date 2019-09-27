/* Wordpress Theme creating gulpfile */
const 
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	browsersync = require('browser-sync'),
	autoprefixer = require('gulp-autoprefixer'),
	sass = require('gulp-sass'),
	groupmediaqueries = require('gulp-group-css-media-queries'),
	mincss = require('gulp-clean-css'),
	sourcemaps = require('gulp-sourcemaps'),
	uglify_es = require('gulp-uglify-es').default,
	rename = require('gulp-rename'),
	replace = require('gulp-replace'),
	rigger = require('gulp-rigger'),
	plumber = require('gulp-plumber'),
	debug = require('gulp-debug'),
	concat = require('gulp-concat'),
	clean = require('gulp-clean'),
	yargs = require('yargs'),
	htmlsplit = require('gulp-htmlsplit'),
	removeCode = require('gulp-remove-code'),
	babel = require('gulp-babel'),
	argv = yargs.argv;

let production = !!argv.prod;

const paths = {
	data: {
		src: [
			'./src/data/**/*.json'
		],
		dist: './dist/data/',
		prod: './prod/data/',
		watch: './src/data/**/*.json'
	},
	views: {
		src: [
			'./src/index.html',
			'./src/pages/*.html'
		],
		dist: './dist/',
		prod: './prod/',
		watch: './src/**/*.html'
	},
	styles: {
		src: './src/styles/**/*.{css,sass}',
		dist: './dist/styles/',
		prod: './prod/styles/',
		watch: [
			'./src/styles/**/*.{css,sass}'
		]
	},
	scripts: {
		src: ['./src/js/**/*.js'],
		dist: './dist/js/',
		prod: './prod/js/',
		watch: [
			'./src/js/**/*.js'
		]
	},
	images: {
		src: [
			'./src/img/**/*.{jpg,jpeg,png,gif,svg}',
			'!./src/img/svg/*.svg',
			'!./src/img/favicon.{jpg,jpeg,png,gif}'
		],
		dist: './dist/img/',
		prod: './prod/img/',
		watch: './src/img/**/*.{jpg,jpeg,png,gif,svg}'
	},
	webp: {
		src: './src/images/**/*_webp.{jpg,jpeg,png}',
		dist: './dist/images/',
		watch: './src/images/**/*_webp.{jpg,jpeg,png}'
	},
	fonts: {
		src: './src/fonts/**/*.{ttf,otf,woff,woff2}',
		dist: './dist/styles/fonts/',
		prod: './prod/fonts/',
		watch: './src/fonts/**/*.{ttf,otf,woff,woff2}'
	},
	server_config: {
		src: './src/.htaccess',
		dist: './dist/'
	}
};

const cleanFiles = () => gulp.src(production ? './prod/*' : './dist/*', {read: false})
	.pipe(clean())
	.pipe(debug({
		'title': 'Cleaning...'
	}));

const data = () => gulp.src(paths.data.src)
	.pipe(gulp.dest(production ? paths.data.prod : paths.data.dist ))
	.pipe(debug({
		'title': 'Data files'
	}));

const fonts = () => gulp.src(paths.fonts.src)
	.pipe(gulp.dest(production ? paths.fonts.prod : paths.fonts.dist))
	.pipe(debug({
		'title': 'Fonts files'
	}));

const views = () => gulp.src(paths.views.src)
	.pipe(rigger())
	.pipe(gulpif(production, replace('bundle.css', 'style.css')))
	.pipe(gulpif(production, replace('bundle.js', 'bundle.min.js')))
	.pipe(removeCode({ production }))
	.pipe(gulpif(production, htmlsplit()))
	.pipe(gulp.dest(production ? paths.views.prod : paths.views.dist))
	.pipe(debug({
		'title': 'HTML files'
	}))
	.on('end', browsersync.reload);

const styles = () => gulp.src(paths.styles.src)
	.pipe(gulpif(!production, sourcemaps.init()))
	.pipe(plumber())
	.pipe(sass())
	.pipe(groupmediaqueries())
	.pipe(gulpif(production, autoprefixer({
		browsers: ['last 12 versions', '> 1%', 'ie 8', 'ie 7']
	})))
	.pipe(gulpif(production, mincss({
		compatibility: 'ie8', level: {
			1: {
				specialComments: 2,
				removeEmpty: true,
				removeWhitespace: true
			},
			2: {
				mergeMedia: true,
				removeEmpty: true,
				removeDuplicateFontRules: true,
				removeDuplicateMediaBlocks: true,
				removeDuplicateRules: true,
				removeUnusedAtRules: false
			}
		}
	})))
	.pipe(plumber.stop())
	.pipe(concat('bundle.css'))
	.pipe(gulpif(production, rename({basename: 'style'})))
	.pipe(gulpif(!production, sourcemaps.write('./maps/')))
	.pipe(gulp.dest(production ? paths.styles.prod : paths.styles.dist))
	.pipe(debug({
		'title': 'CSS files'
	}))
	.pipe(browsersync.stream());

const scripts = () => gulp.src(paths.scripts.src)
	.pipe(concat('bundle.js'))
	.pipe(gulpif(true, babel({
		presets: ['@babel/env']
	})))
	.pipe(gulpif(production, uglify_es({
		'compress': {
			'sequences': true,
			'properties': true,
			'dead_code': true,
			'drop_debugger': true,
			'unsafe': false,
			'unsafe_comps': false,
			'conditionals': true,
			'comparisons': true,
			'evaluate': true,
			'booleans': true,
			'loops': true,
			'unused': true,
			'hoist_funs': true,
			'keep_fargs': true,
			'keep_fnames': false,
			'hoist_vars': false,
			'if_return': true,
			'join_vars': true,
			'collapse_vars': false,
			'reduce_vars': false,
			'side_effects': true,
			'pure_getters': false,
			'pure_funcs': null,
			'negate_iife': false,
			'drop_console': true,
			'passes': 1,
			'global_defs': {}
		}})))
	.pipe(gulpif(production, rename({
		suffix: '.min'
	})))
	.pipe(gulp.dest(production ? paths.scripts.prod : paths.scripts.dist))
	.pipe(debug({
		'title': 'JS files'
	}))
	.on('end', browsersync.reload);

const images = () => gulp.src(paths.images.src)
	.pipe(gulp.dest(production ? paths.images.prod : paths.images.dist))
	.pipe(debug({
		'title': 'Images'
	}))
	.on('end', browsersync.reload);



// eslint-disable-next-line no-undef
const server = () => {
	if(production) return;

	browsersync.init({
		server: './dist/',
		tunnel: false,
		notify: true
	});

	gulp.watch(paths.views.watch, views);
	gulp.watch(paths.styles.watch, styles);
	gulp.watch(paths.scripts.watch, scripts);
	gulp.watch(paths.images.watch, images);
	//gulp.watch(paths.webp.watch, webpimages);
};
exports.clear = cleanFiles;
exports.views = views;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.server = server;

exports.default = production ? gulp.series(cleanFiles, data, fonts, gulp.parallel(views, styles, scripts, images)) : 
gulp.series(cleanFiles, data, fonts, gulp.parallel( views, styles, scripts, images), server);