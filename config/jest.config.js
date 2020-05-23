const paths = require('./paths');

module.exports = {
	rootDir: paths.root,
	roots: [
		'<rootDir>/src'
	],
	collectCoverageFrom: [
		'src/**/*.{js,jsx,ts,tsx}',
		'!src/**/*.d.ts'
	],
	setupFilesAfterEnv: [
		'<rootDir>/config/jest/setupTests.js'
	],
	testMatch: [
		'<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
		'<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
	],
	testEnvironment: 'jest-environment-jsdom-fourteen',
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/ts-jest',
		'^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
		'^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
	},
	transformIgnorePatterns: [
		'[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
		'^.+\\.module\\.(css|sass|scss)$'
	],
	modulePaths: [],
	moduleNameMapper: {
		'^react-native$': 'react-native-web',
		'^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy'
	},
	moduleFileExtensions: [ 'js', 'ts', 'tsx', 'json', 'jsx', 'node' ]
};