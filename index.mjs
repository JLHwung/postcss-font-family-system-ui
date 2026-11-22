// tooling
import getSystemUiFamily from './lib/get-system-ui-family.mjs';
import browserslist from 'browserslist';
import path from 'path';

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
	} else if (browsers != null) {
		fixedReplacer = createReplacer(resolveFamily(undefined));
	}

	// Otherwise they depend on the browserslist config, which is looked up from
	// each CSS file's directory. Cache them per directory.
	const replacersByDirectory = new Map();
	const getReplacer = (from) => {
		if (fixedReplacer) {
			return fixedReplacer;
		}
		// null: no file, the config is looked up from the working directory
		const directory = from ? path.dirname(path.resolve(from)) : null;
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
						decl.value = replace(decl.value, decl.prop);
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

// cheap check before looking up the config and parsing the value
const systemUiPresent = /system-ui/i;
const whitespaceChar = /[\f\n\r\t ]/;
const trailingWhitespace = /[\f\n\r\t ]+$/;
const quotedName = /^(["'])([^]*)\1$/;

// generic font family keywords, which are never dropped or moved
const genericFamilies = new Set([
	'serif',
	'sans-serif',
	'monospace',
	'cursive',
	'fantasy',
	'system-ui',
	'ui-serif',
	'ui-sans-serif',
	'ui-monospace',
	'ui-rounded',
	'emoji',
	'math',
	'fangsong',
]);

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

// family name for comparison: unquoted, whitespace collapsed, case-insensitive.
// Quoted generic names (e.g. "system-ui") are font names, not the keywords, so
// they keep their quotes.
const familyKey = (item) => {
	const trimmed = item.trim();
	const quoted = quotedName.exec(trimmed);
	const name = (quoted ? quoted[2] : trimmed).replace(/\s+/g, ' ').toLowerCase();
	return quoted && genericFamilies.has(name) ? `"${name}"` : name;
};

// the offset of an unquoted system-ui ending a list item, or -1. Only the first
// item of a font shorthand may have other tokens (style, weight, size) before it.
const systemUiOffset = (item, allowPrefix) => {
	const trimmed = item.replace(trailingWhitespace, '');
	const offset = trimmed.length - 'system-ui'.length;
	if (offset < 0 || trimmed.slice(offset).toLowerCase() !== 'system-ui') {
		return -1;
	}
	const prefix = trimmed.slice(0, offset);
	if (prefix && !whitespaceChar.test(prefix[prefix.length - 1])) {
		return -1;
	}
	return allowPrefix || !prefix.trim() ? offset : -1;
};

// replace system-ui in a declaration value with the given fallback list
const createReplacer = (systemUiFamily) => {
	const fallbackKeys = systemUiFamily.map(familyKey);
	// names dropped after system-ui, as they are moved into the fallback list:
	// the fallbacks (e.g. from a previous run or a hand-written stack) except
	// generic keywords, and repeated system-ui
	const movedKeys = new Set(fallbackKeys.filter((key) => !genericFamilies.has(key)));
	movedKeys.add('system-ui');

	return (value, prop) => {
		const shorthand = !/^font-family$/i.test(prop);
		const items = splitList(value);
		let index = -1;
		let offset = -1;
		while (offset === -1 && ++index < items.length) {
			offset = systemUiOffset(items[index], shorthand && index === 0);
		}
		if (offset === -1) {
			return value;
		}
		const head = items.slice(0, index);
		const rest = items
			.slice(index + 1)
			.filter((item) => !movedKeys.has(familyKey(item)));

		// families already listed before system-ui, including the one in the
		// first item of a font shorthand, after the style, weight and size
		const headKeys = new Set(head.map(familyKey));
		if (shorthand && head.length) {
			const words = head[0].trim().split(/\s+/);
			for (let i = 1; i < words.length; i++) {
				headKeys.add(familyKey(words.slice(i).join(' ')));
			}
		}
		const restKeys = new Set(rest.map(familyKey));
		// skip fallbacks listed before system-ui, and generic keywords listed after
		// it, so they don't hide the families in between
		const fallback = systemUiFamily.filter((name, i) => {
			const key = fallbackKeys[i];
			return !headKeys.has(key) && !(genericFamilies.has(key) && restKeys.has(key));
		});

		if (!fallback.length && head.length) {
			// everything is already listed before system-ui: drop system-ui
			return [ ...head, ...rest ].join(',');
		}
		const prefix = items[index].slice(0, offset);
		const names = fallback.length ? fallback : systemUiFamily;
		return [ ...head, `${prefix}${names.join(', ')}`, ...rest ].join(',');
	};
};

// accept a comma-separated string or an array of them, dropping empty names
const parseFamily = (family) => {
	if (!family) {
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
