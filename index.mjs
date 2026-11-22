// tooling
import getSystemUiFamily from './lib/get-system-ui-family.mjs';
import browserslist from 'browserslist';

// plugin
const creator = (opts) => {
	const { family, preserve = true, browsers } = Object(opts);
	let systemUiFamily = family;
	if (typeof family === 'string') {
		systemUiFamily = family.trim().split(/\s*,\s*/);
	} else if (!family) {
		// browsers supported by the configuration
		const supportedBrowsers = browserslist(browsers, {
			ignoreUnknownVersions: true,
		});
		systemUiFamily = getSystemUiFamily(supportedBrowsers, preserve);
	}

	// system-ui and fallbacks match
	const whitespace = '[\\f\\n\\r\\x09\\x20]';
	const systemUiMatch = new RegExp(
		`(^|,|${whitespace}+)(?:system-ui${whitespace}*)(?:,${whitespace}*(?:${systemUiFamily
			.map(escapeRegExp)
			.join('|')})${whitespace}*)?(,|$)`,
		'i'
	);

	// system-ui fallback replacement, as a function so `$` in family names is literal
	const systemUiFallback = systemUiFamily.join(', ');
	const systemUiReplace = (match, before, after) => `${before}${systemUiFallback}${after}`;

	const visited = new WeakSet();
	return {
		postcssPlugin: 'postcss-font-family-system-ui',
		// update font declarations to polyfill system-ui usage
		Declaration(decl) {
			if (decl.prop.match(fontPropertyMatch) && !visited.has(decl)) {
				decl.value = decl.value.replace(systemUiMatch, systemUiReplace);
				visited.add(decl);
			}
		},
	};
};

// Required by PostCSS 8
creator.postcss = true;

export default creator;
/* match the following properties:
 * - font
 * - font-family
 * - custom properties (see https://www.w3.org/TR/css-variables-1/#custom-property)
 */
const fontPropertyMatch = /(?:^(?:-|\\002d){2})|(?:^font(?:-family)?$)/i;

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
