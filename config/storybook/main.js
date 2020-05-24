const paths = require('../paths');
const createWebpackConfig = require('../webpack.config');

module.exports = {
	stories: ['../../src/**/*.stories.*'],
	addons: [ ],
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