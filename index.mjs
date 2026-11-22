// tooling
import getSystemUiFamily from './lib/get-system-ui-family.mjs';
import browserslist from 'browserslist';

// plugin
const creator = (opts) => {
	const { family, preserve = true, browsers } = Object(opts);
	const familyOption = parseFamily(family);
	const fixedReplacer = familyOption.length ? createReplacer(familyOption) : null;

	// Without a family option, the fallbacks depend on the browserslist config,
	// which is resolved relative to each CSS file. Cache replacers per fallback
	// list, since most files share the same config.
	const replacers = new Map();
	const getReplacer = (from) => {
		if (fixedReplacer) {
			return fixedReplacer;
		}
		const supportedBrowsers = browserslist(browsers, {
			path: from,
			ignoreUnknownVersions: true,
		});
		const systemUiFamily = getSystemUiFamily(supportedBrowsers, preserve);
		const key = systemUiFamily.join(',');
		if (!replacers.has(key)) {
			replacers.set(key, createReplacer(systemUiFamily));
		}
		return replacers.get(key);
	};

	return {
		postcssPlugin: 'postcss-font-family-system-ui',
		prepare(result) {
			const replace = getReplacer(result.opts.from);
			const visited = new WeakSet();
			return {
				// update font declarations to polyfill system-ui usage
				Declaration(decl) {
					if (decl.prop.match(fontPropertyMatch) && !visited.has(decl)) {
						decl.value = replace(decl.value);
						visited.add(decl);
					}
				},
			};
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

// replace system-ui in a declaration value with the given fallback list
const createReplacer = (systemUiFamily) => {
	// system-ui and any run of fallbacks already following it, so that existing
	// fallbacks (e.g. from a previous run) are replaced instead of duplicated
	const whitespace = '[\\f\\n\\r\\x09\\x20]';
	const systemUiMatch = new RegExp(
		`(^|,|${whitespace}+)(?:system-ui${whitespace}*)(?:,${whitespace}*(?:${systemUiFamily
			.map(escapeRegExp)
			.join('|')})${whitespace}*)*(,|$)`,
		'i'
	);

	// system-ui fallback replacement, as a function so `$` in family names is literal
	const systemUiFallback = systemUiFamily.join(', ');
	const systemUiReplace = (match, before, after) => `${before}${systemUiFallback}${after}`;

	return (value) => value.replace(systemUiMatch, systemUiReplace);
};

// accept a comma-separated string or an array, dropping empty names
const parseFamily = (family) => {
	const names = typeof family === 'string' ? family.split(',') : family || [];
	return Array.from(names, (name) => String(name).trim()).filter(Boolean);
};
