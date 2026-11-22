const assert = require("node:assert");

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
	"family-values": {
		message: "keeps var(), apostrophes and keyword-like names in { family } intact",
		options: {
			family: "system-ui, var(--brand, Roboto), O'Reilly Sans, initial, Roboto Condensed, Arial",
		},
	},
	"family-split": {
		message: "splits { family } on commas, keeping quotes, apostrophes and var() intact",
		options: {
			family: "system-ui, O'Reilly Sans, Bob's Font, var(--a, Roboto), Foo (Pro, \"Foo, Bar\"",
		},
	},
	"font-face": {
		message: "leaves font-family in @font-face alone",
		options: {
			family: "system-ui, Segoe UI",
		},
	},
	"family-order": {
		message: "keeps the order of { family } around system-ui",
		options: {
			family: "-apple-system, system-ui, Roboto",
		},
	},
	"family-split:paren": {
		message: "doesn't treat a leading parenthesis in { family } as a function",
		options: {
			family: "(Foo, Bar)",
		},
		source: "family-split.css",
	},
	"family-split:repeated": {
		message: "adds names repeated in { family } once",
		options: {
			family: "Roboto, roboto, system-ui, Roboto",
		},
		source: "family-split.css",
	},
	"custom-property-head": {
		message: "keeps keyword-like words of a family before system-ui in custom properties",
		options: {
			family: "system-ui, Sans",
		},
	},
	"family-split:quoting": {
		message: "quotes { family } names that aren't valid unquoted CSS",
		options: {
			family: 'system-ui, Foo(TM), "Foo" Bar "Baz", env(x), M+\r1p, A\fB, "C\nD", "E\\\nF", Foo inherit',
		},
		source: "family-split.css",
	},
	"family-newer-generics": {
		message: "places newer generic families from { family } like other families",
		options: {
			family: "ui-monospace, Menlo, emoji, monospace",
		},
	},
	"family-escaped": {
		message: "keeps escaped spaces when comparing family names",
		options: {
			family: 'system-ui, "Foo  Bar"',
		},
	},
	"family-array": {
		message: "splits comma-separated entries in a { family } array",
		options: {
			family: ["system-ui, Segoe UI", "Roboto", "Helvetica Neue"],
		},
	},
	"basic:invalid_family": {
		message: "rejects { family } entries that are not strings",
		before() {
			const plugin = require("./dist/index.bundle.cjs");
			assert.throws(() => plugin({ family: [null] }), TypeError);
			assert.throws(() => plugin({ family: 123 }), TypeError);
		},
		expect: "basic.expect.css",
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
	"basic:invalid_browsers": {
		message: "rejects an invalid { browsers } option when the plugin is created",
		before() {
			const plugin = require("./dist/index.bundle.cjs");
			assert.throws(() => plugin({ browsers: ["Chrom 60"] }), /Unknown browser Chrom/);
		},
		expect: "basic.expect.css",
	},
	"basic:family:not_preserve": {
		message: "applies { preserve: false } to { family }",
		options: {
			family: "system-ui, Segoe UI, Roboto, Helvetica Neue",
			preserve: false,
		},
	},
	"basic:family:preserve_null": {
		message: "treats a falsy { preserve } like false with { family }",
		options: {
			family: "system-ui, Segoe UI, Roboto, Helvetica Neue",
			preserve: null,
		},
		expect: "basic.family.not_preserve.expect.css",
	},
	"repeated-system-ui:chrome_60": {
		message: "leaves a repeated system-ui alone when no polyfill is needed",
		options: {
			browsers: ["Chrome 60"],
		},
	},
	"repeated-system-ui:not_preserve": {
		message: "drops a repeated system-ui with { preserve: false }",
		options: {
			browsers: ["IE 11"],
			preserve: false,
		},
	},
	"basic:false_family": {
		message: "ignores a falsy { family }",
		options: {
			family: false,
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
		message: "adds only missing fallbacks, keeping listed families in place",
		options: {
			browsers: ["IE 11", "Safari 10"],
		},
	},
	"browserslistrc:browsers_null": {
		message: "uses the browserslist config next to the CSS file when { browsers } is null",
		options: {
			browsers: null,
		},
		source: "browserslistrc/basic.css",
		expect: "browserslistrc/basic.expect.css",
		result: "browserslistrc/basic.result.css",
	},
	"existing-fallbacks:not_preserve": {
		message: "drops system-ui when its fallbacks are already listed before it",
		options: {
			browsers: ["IE 11", "Safari 10"],
			preserve: false,
		},
	},
	"family-generic": {
		message: "keeps generic families from { family } behind the families that follow system-ui",
		options: {
			family: "system-ui, -apple-system, sans-serif",
		},
	},
	"family-generic:only": {
		message: "drops system-ui when { family } only has generic families that follow it",
		options: {
			family: "sans-serif",
		},
	},
	"browserslistrc": {
		message: "uses the browserslist config next to the CSS file",
		source: "browserslistrc/basic.css",
		expect: "browserslistrc/basic.expect.css",
		result: "browserslistrc/basic.result.css",
	},
	"custom-properties": {
		message: "supports custom-properties usage",
	},
};
