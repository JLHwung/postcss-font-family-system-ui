module.exports = {
	basic: {
		message: "supports basic usage",
	},
	"basic:family": {
		message: "supports { family } usage",
		options: {
			family: "system-ui, Segoe UI, Roboto, Helvetica Neue",
		},
	},
	"basic:empty_family_array": {
		message: "ignores an empty { family } array",
		options: {
			family: [],
		},
		expect: "basic.expect.css",
	},
	"basic:empty_family_string": {
		message: "ignores a { family } string without names",
		options: {
			family: " , ",
		},
		expect: "basic.expect.css",
	},
	"basic:browser:chrome_60": {
		message: "supports simple { browsers } usage",
		options: {
			browsers: ["Chrome 60"],
		},
	},
	"basic:browser:chrome_60:not_preserve": {
		message: "preserve: false is no-op when browsers are modern",
		options: {
			browsers: ["Chrome 60"],
			preserve: false,
		},
	},
	"basic:browser:safari_9": {
		message: "polyfills browsers whose support is unknown",
		options: {
			browsers: ["Safari 9"],
		},
	},
	"basic:browser:firefox_60": {
		message: "adds generic fallbacks when support is only on Mac (-apple-system)",
		options: {
			browsers: ["Firefox 60"],
		},
	},
	"basic:browser:chrome_55": {
		message: "adds generic fallbacks when support is only on Mac (BlinkMacSystemFont)",
		options: {
			browsers: ["Chrome 55"],
		},
	},
	"basic:browser:safari_10": {
		message: "does not add generic fallbacks for Apple-only browsers",
		options: {
			browsers: ["Safari 10"],
		},
	},
	"basic:browser:whole_coverage": {
		message: "supports complex { browsers } usage",
		options: {
			browsers: [
				"Safari 9",
				"Safari 10",
				"IE 11",
				"Chrome 55",
				"Chrome 56",
				"Firefox 57",
			],
		},
	},
	"basic:browser:edged_version": {
		message: "supports browsers usage when caniuse is out-of-dated",
		options: {
			browsers: ["Chrome 1048576"],
		},
	},
	"basic:not_preserve": {
		message: "supports simple { preserve } usage",
		options: {
			preserve: false,
		},
	},
	"family-special": {
		message: "treats special characters in { family } literally",
		options: {
			family: "system-ui, M+ 1p, Foo (Pro, $& Sans",
		},
	},
	"existing-fallbacks": {
		message: "replaces existing fallbacks instead of duplicating them",
		options: {
			browsers: ["IE 11", "Safari 10"],
		},
	},
	"custom-properties": {
		message: "supports custom-properties usage",
	},
};
