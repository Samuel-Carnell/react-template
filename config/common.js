const pathUtils = require('path');
const filesystemUtils = require('fs');
const rootDir = pathUtils.resolve(__dirname, '..');

const resolveFile = (folder, filename, extensions) => {
	const files = extensions
		.map((ext) => `${pathUtils.resolve(folder, filename)}.${ext}`)
		.filter(filesystemUtils.existsSync);
	if (files.length === 0) {
		throw new Error(
			`Can't find file ${filename} with extension ${extensions.join(',')}`
		);
	}

	return files[0];
};

const files = {
	tsConfig: resolveFile(rootDir, 'tsconfig', ['json']),
	packageJson: resolveFile(rootDir, 'package', ['json']),
	tailwindConfig: resolveFile(rootDir, 'tailwind.config', ['js']),
	htmlTemplate: resolveFile(pathUtils.resolve(rootDir, 'src'), 'template' , ['html']),
	index: resolveFile(pathUtils.resolve(rooDir, 'src'), 'index', [
		'ts',
		'tsx',
		'js',
		'jsx'
	])
};


const createNegativeLookahead = (patterns) =>
	patterns.length > 0 ? `(?!.*(${patterns.join('|')}))` : '';
const useFirstMatch = (patterns) => {
	let alreadyUsed = [];
	const newPatterns = Object.keys(patterns)
		.map((key) => {
			const { [key]: pattern } = patterns;
			const newPattern = `^${createNegativeLookahead(alreadyUsed)}.*${pattern}`;
			alreadyUsed = [...alreadyUsed, pattern];
			return [key, newPattern];
		})
		.reduce(
			(result, [key, pattern]) => ({
				...result,
				[key]: pattern
			}),
			{}
		);

	const newRegExpsWithFallback = {
		...newPatterns,
		fallback: `^${createNegativeLookahead(alreadyUsed)}.*$`
	};

	return newRegExpsWithFallback;
};

const tsConfig = require(files.tsConfig);
const packageJson = require(files.packageJson);
const basePath =
	tsConfig && tsConfig.compilerOptions && tsConfig.compilerOptions.baseUrl
		? tsConfig.compilerOptions.baseUrl
		: files.src;

module.exports = {
	rootDir,
	files,
	tsConfig,
	packageJson,
	resolveModule: {
		// Look for modules in the node_modules folder first to mimic NodeJs' module resolution behaviour
		rootDirs: ['node_modules', basePath],
		// Files will be resolved in this order to be consistent with cra
		fileExtensions: ['mjs', 'js', 'ts', 'tsx', 'json', 'jsx']
	},
	regexPatterns: {
		nodeModules: 'node_modules[\/\\\\]',
		// Ignores patterns that a have come before the current pattern.
		// This is required to prevent unexpected errors occurring where imports are processed twice,
		// for example with css modules being processed as a module and a standard css file.
		// This also creates a handy fallback pattern which ignores all patterns already declared,
		// and can be used to process unknown files.
		...useFirstMatch({
			internalScripts: 'src[\/\\\\].*\\.(ts|tsx|js|jsx|mjs)$',
			externalScripts: 'node_modules[\/\\\\].*\\.js$',
			cssModules: '\\.(styles|module)\\.css$',
			css: '\\.css$',
			svg: '\\.svg$',
			json: '\\.json$',
			ejs: '\\.ejs$'
		})
	},
	globPatterns: {
		scripts: '**/*.{ts,tsx,js,jsx,mjs}',
		reactScripts: '**/*.{jsx,tsx}',
		tests: '**/*.{test,spec}.{ts,tsx,js,jsx}',
		stories: '**/*.stories.{ts,tsx,js,jsx}'
	},
	output: {
		path: pathUtils.resolve(rootDir, 'dist'),
		createOutputPath: (folder, extension) =>
			`${folder}/[name].[contenthash:8].${extension}`
	}
};
