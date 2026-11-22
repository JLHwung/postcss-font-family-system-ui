// tooling
import getSystemUiFamily from './lib/get-system-ui-family.mjs';
import browserslist from 'browserslist';

// plugin
const creator = (opts) => {
	const { family, preserve = true, browsers } = Object(opts);
	const familyOption = parseFamily(family);
	const resolveFamily = (path) =>
		getSystemUiFamily(browserslist(browsers, { path, ignoreUnknownVersions: true }), preserve);

	// With a family or browsers option, the fallbacks are the same for every
	// file, so resolve them now and let invalid options fail early.
	let fixedReplacer = null;
	if (familyOption.length) {
		fixedReplacer = createReplacer(familyOption);
	} else if (browsers !== undefined) {
		fixedReplacer = createReplacer(resolveFamily(undefined));
	}

	// Otherwise they depend on the browserslist config, which is looked up from
	// each CSS file's directory. Cache them per directory.
	const replacersByDirectory = new Map();
	const getReplacer = (from) => {
		if (fixedReplacer) {
			return fixedReplacer;
		}
		const directory = from ? from.replace(/[\\/][^\\/]*$/, '') : '';
		if (!replacersByDirectory.has(directory)) {
			replacersByDirectory.set(directory, createReplacer(resolveFamily(from)));
		}
		return replacersByDirectory.get(directory);
	};

	return {
		postcssPlugin: 'postcss-font-family-system-ui',
		prepare(result) {
			let replace;
			const visited = new WeakSet();
			return {
				// update font declarations to polyfill system-ui usage
				Declaration(decl) {
					if (
						decl.prop.match(fontPropertyMatch) &&
						!visited.has(decl) &&
						systemUiPresent.test(decl.value)
					) {
						// look up the config only for files that use system-ui
						replace ??= getReplacer(result.opts.from);
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

// unquoted system-ui as a whole family name
const whitespace = '[\\f\\n\\r\\x09\\x20]';
const systemUiMatch = new RegExp(`(^|,|${whitespace}+)system-ui${whitespace}*(,|$)`, 'i');
// cheap check before looking up the config and parsing the value
const systemUiPresent = /system-ui/i;
// the comma (and whitespace) ending the family list before system-ui
const headListEnd = new RegExp(`${whitespace}*,${whitespace}*$`);

// split a value on commas outside of quotes and parentheses, keeping whitespace
const splitList = (value) => {
	const items = [];
	let start = 0;
	let depth = 0;
	let quote = '';
	for (let i = 0; i < value.length; i++) {
		const char = value[i];
		if (char === '\\') {
			i++;
		} else if (quote) {
			if (char === quote) {
				quote = '';
			}
		} else if (char === '"' || char === '\'') {
			quote = char;
		} else if (char === '(') {
			depth++;
		} else if (char === ')') {
			depth = Math.max(0, depth - 1);
		} else if (char === ',' && depth === 0) {
			items.push(value.slice(start, i));
			start = i + 1;
		}
	}
	items.push(value.slice(start));
	return items;
};

// family name for comparison: unquoted, whitespace collapsed, case-insensitive
const normalizeName = (name) =>
	name
		.trim()
		.replace(/^(["'])(.*)\1$/, '$2')
		.replace(/\s+/g, ' ')
		.toLowerCase();

// replace system-ui in a declaration value with the given fallback list
const createReplacer = (systemUiFamily) => {
	const fallbackNames = systemUiFamily.map(normalizeName);
	// names to drop after system-ui: the fallbacks (e.g. from a previous run or
	// a hand-written stack) and repeated system-ui
	const knownNames = new Set([ ...fallbackNames, 'system-ui' ]);

	return (value) => {
		const match = systemUiMatch.exec(value);
		if (!match) {
			return value;
		}
		const [ whole, before, comma ] = match;
		const head = value.slice(0, match.index);
		// don't repeat fallbacks that are already listed before system-ui
		const headNames = new Set(splitList(head).map(normalizeName));
		const newNames = systemUiFamily.filter((name, i) => !headNames.has(fallbackNames[i]));
		const rest = comma
			? splitList(value.slice(match.index + whole.length)).filter(
				(item) => !knownNames.has(normalizeName(item))
			)
			: [];
		// every fallback is already listed before system-ui: drop system-ui
		const headList = head.replace(headListEnd, '');
		if (!newNames.length && headList !== head) {
			return [ headList, ...rest ].join(',');
		}
		const fallback = (newNames.length ? newNames : systemUiFamily).join(', ');
		return [ `${head}${before}${fallback}`, ...rest ].join(',');
	};
};

// accept a comma-separated string or an array of them, dropping empty names
const parseFamily = (family) => {
	if (family == null) {
		return [];
	}
	const entries = Array.isArray(family) ? family : [ family ];
	return entries
		.reduce((names, entry) => {
			if (typeof entry !== 'string') {
				throw new TypeError(
					'postcss-font-family-system-ui: `family` must be a string or an array of strings'
				);
			}
			return names.concat(splitList(entry));
		}, [])
		.map((name) => name.trim())
		.filter(Boolean);
};
