import babel from 'rollup-plugin-babel';

export default {
	input: 'index.js',
	output: { file: 'index.bundle.js', format: 'cjs' },
	plugins: [
		babel({
			presets: [
				['@babel/preset-env', { modules: false, targets: { node: 6 }, loose: true }]
			],
			plugins: [
					['@babel/plugin-transform-for-of', { assumeArray: true }]
			]
		})
	]
};
