import babel from "@rollup/plugin-babel";

export default {
	input: "index.mjs",
	output: { file: "index.bundle.cjs", format: "cjs", exports: "default" },
	plugins: [
		babel.default({
			babelHelpers: "bundled",
		}),
	],
};
