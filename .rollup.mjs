import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";

export default {
	input: "index.mjs",
	output: { file: "index.bundle.cjs", format: "cjs" },
	plugins: [
		babel.default({
			presets: [["@babel/preset-env", { targets: { node: 6 }, loose: true }]],
			plugins: [["@babel/plugin-transform-for-of", { assumeArray: true }]],
			babelHelpers: "bundled",
		}),
		json(),
	],
};
