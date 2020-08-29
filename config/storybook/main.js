const path = require('path');
const paths = require('../paths');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const createWebpackConfig = require('../webpack.config');

const iconPath = path.resolve(__dirname, './icon.png');

module.exports = {
	stories: [`${paths.asPosix(paths.src)}/**/*.stories.*`],
	addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
	webpackFinal: async (defaultConfig) => {
		const customConfig = createWebpackConfig({}, { mode: 'development' });
		const config = {
			...defaultConfig,
			resolve: {
				...defaultConfig.resolve,
				...customConfig.resolve
			},
			module: {
				...defaultConfig.module,
				rules: [
					{
						exclude: paths.hasExtension('ejs'),
						rules: customConfig.module.rules
					}
				]
			},
			plugins: [
				...defaultConfig.plugins,
				new WebpackBuildNotifierPlugin({
					title: 'Storybook',
					successIcon: iconPath,
					warningIcon: iconPath,
					failureIcon: iconPath,
					compileIcon: iconPath,
					suppressSuccess: true,
					suppressWarning: true
				})
			]
		};
		return config;
	}
};
