const { env } = require('process');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');
const autoPrefixer = require('autoprefixer');
const postcssNormalize = require('postcss-normalize');
const tailwind = require('tailwindcss');
const purgecss = require('@fullhuman/postcss-purgecss');

const paths = require('./paths');

const appPackage = require(paths.packageJson);
const tsConfig = require(paths.tsConfig);

const arrayToRegex = (array) => {
	const regexString = array
		.map((str) => str.replace('.', '.')) // eslint-disable-line no-useless-escape
		.join('|');
	return new RegExp(`(${regexString})$`, 'u');
};

module.exports = (webpackEnv, args) => {
	const mode = args.mode || env.NODE_ENV;
	const isDevMode = mode !== 'production';

	const cssExts = ['.css'];
	const cssModuleExts = ['.module.css', '.styles.css'];
	const typescriptExts = ['.ts', '.tsx', '.js', '.jsx'];
	const svgExts = ['.svg'];
	const htmlExts = ['.html', '.htm'];
	const jsonExts = ['.json'];
	const nodeModuleRegex = /node_modules/;

	const getCssLoaders = (extraCssOptions) => [
		{
			loader: isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader
		},
		{
			loader: 'css-loader',
			options: {
				sourceMap: !isDevMode,
				importLoaders: 1,
				...extraCssOptions
			}
		},
		{
			loader: 'postcss-loader',
			options: {
				ident: 'postcss',
				plugins: () => [
					tailwind(),
					autoPrefixer(),
					postcssNormalize(),
					...(isDevMode
						? []
						: [
								purgecss({
									content: ['./src/**/*.html', './src/**/*.tsx']
								})
						  ])
				]
			}
		}
	];

	return {
		stats: isDevMode ? 'normal' : 'verbose',
		resolve: {
			modules: [
				...(tsConfig.compilerOptions.baseUrl === undefined
					? []
					: [tsConfig.compilerOptions.baseUrl]),
				'node_modules'
			],
			extensions: typescriptExts
		},
		output: {
			path: paths.build,
			filename: isDevMode ? 'js/[name].js' : 'js/[name].[contenthash:8].js',
			chunkFilename: isDevMode
				? 'js/[name].chunk.js'
				: 'js/[name].[contenthash:8].js'
		},
		devtool: isDevMode ? 'cheap-module-source-map' : 'source-map',
		module: {
			rules: [
				{
					exclude: nodeModuleRegex,
					oneOf: [
						{
							include: arrayToRegex(typescriptExts),
							use: [
								'babel-loader',
								{
									loader: 'ts-loader',
									options: {
										configFile: paths.tsConfig,
										onlyCompileBundledFiles: true
									}
								}
							]
						},
						{
							include: arrayToRegex(cssModuleExts),
							use: getCssLoaders({
								localsConvention: 'camelCase',
								modules: {
									localIdentName: '[name]__[local]--[hash:8]'
								}
							})
						},
						{
							include: arrayToRegex(cssExts),
							exclude: arrayToRegex(cssModuleExts),
							use: getCssLoaders({
								modules: false
							})
						},
						{
							include: arrayToRegex(svgExts),
							loader: '@svgr/webpack'
						},
						{
							exclude: arrayToRegex([...jsonExts, ...htmlExts]),
							loader: 'file-loader',
							options: {
								name: 'assets/[name].[hash:8].[ext]'
							}
						}
					]
				}
			]
		},
		optimization: {
			minimize: !isDevMode,
			minimizer: [
				new UglifyJsPlugin({
					sourceMap: true,
					extractComments: true,
					uglifyOptions: {
						toplevel: true,
						mangle: {
							eval: true
						}
					}
				}),
				new OptimizeCSSAssetsPlugin({
					cssProcessorOptions: {
						map: {
							inline: false
						}
					}
				})
			],
			splitChunks: {
				chunks: 'all'
			},
			runtimeChunk: {
				name: (entrypoint) => `runtime~${entrypoint.name}`
			}
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: paths.template,
				...(isDevMode
					? {}
					: {
							minify: {
								removeComments: true,
								collapseWhitespace: true,
								removeRedundantAttributes: true,
								useShortDoctype: true,
								removeEmptyAttributes: true,
								removeStyleLinkTypeAttributes: true,
								keepClosingSlash: true,
								minifyJS: true,
								minifyCSS: true,
								minifyURLs: true
							}
					  })
			}),
			new CheckerPlugin(),
			new CleanWebpackPlugin(),
			new WebpackBuildNotifierPlugin({
				title: 'My Awesome Project',
				suppressSuccess: true,
				suppressWarning: true
			}),
			...(isDevMode
				? []
				: [
						new MiniCssExtractPlugin({
							filename: 'css/[name].[contenthash:8].css',
							chunkFilename: 'css/[name].[contenthash:8].chunk.css'
						}),
						new ManifestPlugin({
							fileName: 'manifest.json',
							seed: appPackage.manifest,
							generate: (seed, files, entrypoints) => {
								const manifestFiles = files.reduce((manifest, file) => {
									if (!file.name.endsWith('.map')) {
										manifest[file.name] = file.path;
									}
									return manifest;
								}, seed);
								const entrypointFiles = entrypoints.main.filter(
									(fileName) => !fileName.endsWith('.map')
								);

								return {
									name: appPackage.name,
									files: manifestFiles,
									entrypoints: entrypointFiles
								};
							}
						})
				  ])
		],
		devServer: {
			compress: true,
			clientLogLevel: 'none',
			hot: true,
			quiet: true,
			historyApiFallback: true,
			open: true
		},
		watchOptions: {
			ignored: /node_modules/
		}
	};
};
