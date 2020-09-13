const pathUtils = require('path');
const common = require('../common');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const createWebpackConfig = require('../webpack.config');

const { storybookIcon } = common.files;
const relativeFromRoot = pathUtils
	.relative(__dirname, common.rootDir)
	.split(pathUtils.sep)
	.join('/');

module.exports = {
	stories: [`${relativeFromRoot}/src${common.globPatterns.stories}`],
	addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
	webpackFinal: async (defaultConfig) => {
		const customConfig = createWebpackConfig(null, { mode: 'development' });
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
						// Storybook imports ejs files internally, so they need to be excluded to prevent them from being processed by the file loader
						exclude: new RegExp(common.regexPatterns.ejs),
						rules: customConfig.module.rules
					}
				]
			},
			plugins: [
				...defaultConfig.plugins,
				new WebpackBuildNotifierPlugin({
					title: 'Storybook',
					successIcon: storybookIcon,
					warningIcon: storybookIcon,
					failureIcon: storybookIcon,
					compileIcon: storybookIcon,
					suppressSuccess: true,
					suppressWarning: true
				})
			]
		};

		return config;
	}
};
