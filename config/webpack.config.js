const path = require('path');
const { env } = require('process');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const autoPrefixer = require('autoprefixer');
const postcssNormalize = require('postcss-normalize');
const tailwind = require('tailwindcss');
const purgecss = require('@fullhuman/postcss-purgecss');
const postcssImport = require('postcss-import');
const common = require('./common');

module.exports = (webpackEnv, args) => {
	const mode = args.mode || env.NODE_ENV;
	const isDevMode = mode !== 'production';

	const getCssLoaders = ({ useCssModules }) => [
		{
			loader: isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader
		},
		{
			loader: 'css-loader',
			options: {
				sourceMap: !isDevMode,
				importLoaders: 1,
				...(!useCssModules
					? {}
					: {
							localsConvention: 'camelCase',
							modules: {
								localIdentName: '[name]__[local]--[hash:8]'
							}
					  })
			}
		},
		{
			loader: 'postcss-loader',
			options: {
				ident: 'postcss',
				plugins: () => [
					postcssImport({
						root: common.rootDir,
						path: common.resolveModule.rootDirs
					}),
					tailwind(),
					autoPrefixer(),
					postcssNormalize(),
					...(isDevMode
						? []
						: [
								purgecss({
									content: [`${paths.asPosix(paths.src)}/**/*.{html,tsx,jsx}`]
								})
						  ])
				],
				sourceMap: !isDevMode
			}
		}
	];

	return {
		context: common.rootDir,
		entry: common.files.index,
		stats: isDevMode ? 'normal' : 'verbose',
		resolve: {
			// Look for modules in the node_modules folder first to mimic NodeJs' module resolution behaviour
			modules: ['node_modules', common.resolveModule.rootDir],
			extensions: common.resolveModule.fileExtensions.map((ext) => `.${ext}`)
		},
		output: {
			path: common.output.path,
			filename: common.output.createOutputPath('js', 'js'),
			chunkFilename: common.output.createOutputPath('js', 'chunk.js')
		},
		devtool: isDevMode ? 'cheap-module-source-map' : 'source-map',
		module: {
			rules: [
				{
					oneOf: [
						{
							test: new RegExp(common.regexPatterns.internalScripts),
							use: [
								{
									loader: 'babel-loader',
									options: {
										presets: ['@babel/preset-env'],
										cacheDirectory: isDevMode,
										cacheCompression: true,
										babelrc: false,
										configFile: false
									}
								},
								{
									loader: 'ts-loader',
									options: {
										configFile: common.files.tsConfig,
										onlyCompileBundledFiles: true
									}
								}
							]
						},
						{
							test: new RegExp(common.regexPatterns.cssModules),
							use: getCssLoaders({ useCssModules: true })
						},
						{
							test: new RegExp(common.regexPatterns.css),
							use: getCssLoaders({ useCssModules: false })
						},
						{
							test: new RegExp(common.regexPatterns.svg),
							use: {
								loader: '@svgr/webpack'
							}
						},
						{
							test: new RegExp(common.regexPatterns.fallback),
							use: {
								loader: 'file-loader',
								options: {
									name: common.output.createOutputPath('assets', '[ext]')
								}
							}
						}
					]
				}
			]
		},
		optimization: {
			minimize: !isDevMode,
			minimizer: [
				new TerserPlugin({
					sourceMap: !isDevMode,
					terserOptions: {
						module: true,
						toplevel: true,
						safari10: true,
						output: {
							comments: false,
							ascii_only: true
						}
					}
				}),
				new OptimizeCSSAssetsPlugin({
					cssProcessorOptions: {
						map: {
							inline: false,
							annotation: true
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
				template: common.files.htmlTemplate,
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
							filename: common.output.createOutputPath('css', 'css'),
							chunkFilename: common.output.createOutputPath('css', 'chunk.css')
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
			ignored: new RegExp(common.regexPatterns.nodeModules)
		}
	};
};
