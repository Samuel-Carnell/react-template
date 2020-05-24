const paths = require('../paths');
const createWebpackConfig = require('../webpack.config');

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
			module: { ...defaultConfig.module, ...customConfig.module }
		};
		return config;
	}
};