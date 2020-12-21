module.exports = {
	env: {
		commonjs: true,
		es6: true,
		node: true,
	},
	extends: 'airbnb-base',
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2020,
	},
	rules: {
		indent: [
			'error',
			'tab',
		],
		'no-tabs': 0,
		'no-use-before-define': 0,
		'no-console': 0,
		'linebreak-style': false,
		'max-len': 0,
		quotes: [
			'error',
			'single',
		],
		semi: [
			'error',
			'always',
		],
		'no-prototype-builtins': 0,
		'comma-dangle': ['error', 'always-multiline'],
		'block-scoped-var': ['error'],
		'default-case': ['error'],
		'default-param-last': ['error'],
		'dot-location': ['error', 'property'],
		eqeqeq: ['error'],
		'no-eval': ['error'],
		'no-eq-null': ['error'],
		'no-floating-decimal': ['error'],
		'no-trailing-spaces': ['error'],
		'brace-style': [2, '1tbs', { allowSingleLine: true }],
	},
	ignorePatterns: [
		'*.min.js',
	],
};
