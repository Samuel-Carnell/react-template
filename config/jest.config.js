const common = require('./common');

module.exports = {
	rootDir: common.rootDir,
	roots: ['<rootDir>/src/'],
	collectCoverageFrom: [
		`<rootDir>/src/${common.globPatterns.scripts}`,
		'!<rootDir>/src/**/*.d.ts'
	],
	setupFilesAfterEnv: ['jest-enzyme'],
	testEnvironment: 'enzyme',
	testEnvironmentOptions: {
		enzymeAdapter: 'react16'
	},
	testMatch: [
		`<rootDir>/src/**/__tests__/${common.globPatterns.scripts}`,
		`<rootDir>/src/${common.globPatterns.tests}`
	],
	transform: {
		[common.regexPatterns.internalScripts]: common.jestTransformers.tsJest,
		[common.regexPatterns.css]: common.jestTransformers.cssTransform,
		[common.regexPatterns.svg]: common.jestTransformers.svgTransform,
		[common.regexPatterns.fallback]: common.jestTransformers.fileTransform
	},
	moduleNameMapper: {
		[common.regexPatterns.cssModules]: 'identity-obj-proxy'
	},
	moduleFileExtensions: common.resolveModule.fileExtensions,
	modulePaths: [`<rootDir>${common.resolveModule.rootDir}`]
};
