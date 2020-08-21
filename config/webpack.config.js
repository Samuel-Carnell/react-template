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
const paths = require('./paths');

const appPackage = require(paths.packageJson);
const tsConfig = require(paths.tsConfig);

const getTsConfigBasePath = () => {
	const { compilerOptions } = tsConfig;
	if (compilerOptions == null || compilerOptions.baseUrl == null) {
		return null;
	}

	return compilerOptions.baseUrl;
};

const getBasePathsToResolveFrom = () => {
	const tsConfigBasePath = getTsConfigBasePath();
	return [
		...(tsConfigBasePath === null ? [] : [tsConfigBasePath]),
		'node_modules'
	];
};

const useFirstMatch = (moduleRules) => {
	let matchedConditions = [];
	return moduleRules.map(({ test, use, ...moduleRule }) => {
		const excludeMatchedConditions = { not: matchedConditions };

		const moduleRuleExcludingMatchedConditions = {
			test:
				test == null
					? excludeMatchedConditions
					: {
							and: [test, excludeMatchedConditions]
					  },
			use: Array.isArray(use) ? use : [use],
			...moduleRule
		};

		matchedConditions = [...matchedConditions, test];
		return moduleRuleExcludingMatchedConditions;
	});
};

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
						root: paths.root,
						path: getBasePathsToResolveFrom()
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

	const getFilename = () => (isDevMode ? '[name]' : '[name].[contenthash:8]');

	return {
		context: paths.root,
		stats: isDevMode ? 'normal' : 'verbose',
		resolve: {
			modules: getBasePathsToResolveFrom(),
			extensions: ['.tsx', '.ts', '.js', '.jsx']
		},
		output: {
			path: paths.build,
			filename: `js/${getFilename()}.js`,
			chunkFilename: `js/${getFilename()}.chunk.js`
		},
		devtool: isDevMode ? 'cheap-module-source-map' : 'source-map',
		module: {
			rules: [
				{
					exclude: [paths.htmlTemplate, paths.hasExtension('json')],
					oneOf: useFirstMatch([
						{
							test: paths.hasExtension('tsx', 'ts', 'jsx', 'mjs', 'js'),
							include: paths.src,
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
										configFile: paths.tsConfig,
										onlyCompileBundledFiles: true
									}
								}
							]
						},
						{
							test: paths.hasExtension('styles.css', 'module.css'),
							use: getCssLoaders({ useCssModules: true })
						},
						{
							test: paths.hasExtension('css'),
							use: getCssLoaders({ useCssModules: false })
						},
						{
							test: paths.hasExtension('svg'),
							use: {
								loader: '@svgr/webpack'
							}
						},
						{
							use: {
								loader: 'file-loader',
								options: {
									name: 'assets/[name].[hash:8].[ext]'
								}
							}
						}
					])
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
				template: paths.htmlTemplate,
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
							filename: `css/${getFilename()}.css`,
							chunkFilename: `css/${getFilename()}.chunk.css`
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
