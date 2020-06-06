const path = require('path');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const createWebpackConfig = require('../webpack.config');

const iconPath = path.resolve(__dirname, './icon.png');

module.exports = {
	stories: ['../../src/**/*.stories.*'],
	addons: [
		'@storybook/addon-viewport/register',
		'@storybook/addon-actions/register',
		'@storybook/addon-a11y/register',
		'@storybook/addon-knobs/register'
	],
	webpackFinal: async defaultConfig => {
		const customConfig = createWebpackConfig({}, {
			mode: 'development'
		});
		const config = {
			...defaultConfig,
			resolve: {
				...defaultConfig.resolve,
				extensions: customConfig.resolve.extensions,
				modules: customConfig.resolve.modules
			},
			module: { ...defaultConfig.module, ...customConfig.module },
			plugins: [
				...defaultConfig.plugins,
				new WebpackBuildNotifierPlugin({
					title: 'Storybook',
					successIcon: iconPath,
					warningIcon: iconPath,
					failureIcon: iconPath,
					compileIcon: iconPath
				})
			]
		};
		return config;
	}
};