// tooling
import getSystemUiFamily from './lib/get-system-ui-family.mjs';
import browserslist from 'browserslist';

// plugin
const creator = (opts) => {
	const { family, preserve = true, browsers } = Object(opts);
	const familyOption = parseFamily(family);
	const resolveFamily = (from) =>
		getSystemUiFamily(
			browserslist(browsers, { path: from, ignoreUnknownVersions: true }),
			preserve
		);

	// With a family or browsers option, the fallbacks are the same for every
	// file, so resolve them now and let invalid options fail early.
	let fixedReplacer = null;
	if (familyOption.length) {
		fixedReplacer = createReplacer(familyOption);
	} else if (browsers != null) {
		fixedReplacer = createReplacer(resolveFamily(undefined));
	}

	// Otherwise they depend on the browserslist config, which is looked up from
	// each CSS file's location. browserslist caches config files and queries
	// (and clears them in watch mode), so only cache the compiled replacers.
	const replacers = new Map();
	const getReplacer = (from) => {
		if (fixedReplacer) {
			return fixedReplacer;
		}
		const systemUiFamily = resolveFamily(from);
		const key = systemUiFamily.join(',');
		if (!replacers.has(key)) {
			replacers.set(key, createReplacer(systemUiFamily));
		}
		return replacers.get(key);
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
const leadingWhitespace = /^[\f\n\r\t ]+/;
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

// split a value on commas outside of quotes and parentheses, keeping
// whitespace. An unclosed quote or parenthesis, e.g. in an unquoted family
// name such as O'Reilly, is treated as a plain character.
const splitList = (value, quotes = true, parens = true) => {
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
		} else if (quotes && (char === '"' || char === '\'')) {
			quote = char;
		} else if (parens && char === '(') {
			depth++;
		} else if (parens && char === ')') {
			depth = Math.max(0, depth - 1);
		} else if (char === ',' && depth === 0) {
			items.push(value.slice(start, i));
			start = i + 1;
		}
	}
	if (quote) {
		return splitList(value, false, parens);
	}
	if (depth > 0) {
		return splitList(value, quotes, false);
	}
	items.push(value.slice(start));
	return items;
};

// decode CSS escapes: `\` followed by 1-6 hex digits (and an optional
// whitespace), or by any other character
const unescapeCss = (string) =>
	string.replace(/\\(?:([0-9a-f]{1,6})[\t\n\f\r ]?|([^]))/gi, (match, hex, char) => {
		if (!hex) {
			return char;
		}
		const codePoint = parseInt(hex, 16);
		const valid = codePoint > 0 && codePoint <= 0x10ffff && (codePoint < 0xd800 || codePoint > 0xdfff);
		return valid ? String.fromCodePoint(codePoint) : '\ufffd';
	});

// family name for comparison: unquoted and case-insensitive, with whitespace
// collapsed in unquoted names (in quoted ones it is part of the name). Quoted
// generic names (e.g. "system-ui") are font names, not the keywords, so they
// keep their quotes.
const familyKey = (item) => {
	const trimmed = item.trim();
	const quoted = quotedName.exec(trimmed);
	const name = (
		quoted ? unescapeCss(quoted[2]) : unescapeCss(trimmed).replace(/\s+/g, ' ')
	).toLowerCase();
	return quoted && genericFamilies.has(name) ? `"${name}"` : name;
};

// the offset of an unquoted system-ui ending a list item, or -1. Only the first
// item of a font shorthand may have other tokens (style, weight, size) before
// it, and only if they are followed by system-ui alone, not e.g. `Foo system-ui`.
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
	if (!prefix.trim()) {
		return offset;
	}
	return allowPrefix && familyKey(shorthandFamily(item)) === 'system-ui' ? offset : -1;
};

// split a value on whitespace outside of quotes and parentheses
const splitWords = (value) => {
	const words = [];
	let word = '';
	let depth = 0;
	let quote = '';
	for (let i = 0; i < value.length; i++) {
		const char = value[i];
		if (char === '\\') {
			word += value.slice(i, i + 2);
			i++;
			continue;
		}
		if (quote) {
			if (char === quote) {
				quote = '';
			}
		} else if (char === '"' || char === '\'') {
			quote = char;
		} else if (char === '(') {
			depth++;
		} else if (char === ')') {
			depth = Math.max(0, depth - 1);
		} else if (depth === 0 && whitespaceChar.test(char)) {
			if (word) {
				words.push(word);
			}
			word = '';
			continue;
		}
		word += char;
	}
	if (word) {
		words.push(word);
	}
	return words;
};

// a CSS identifier, with escapes
const identifier = /^(?:--|-?(?:[a-z_\u0080-￿]|\\[^]))(?:[\w\-\u0080-￿]|\\[^])*$/i;

// keywords that can come before the family in a font shorthand
const shorthandKeywords = new Set([
	'normal',
	'italic',
	'oblique',
	'small-caps',
	'bold',
	'bolder',
	'lighter',
	'ultra-condensed',
	'extra-condensed',
	'condensed',
	'semi-condensed',
	'semi-expanded',
	'expanded',
	'extra-expanded',
	'ultra-expanded',
	'xx-small',
	'x-small',
	'small',
	'medium',
	'large',
	'x-large',
	'xx-large',
	'xxx-large',
	'larger',
	'smaller',
]);

const isFamilyWord = (word) => quotedName.test(word) || identifier.test(word);

// the family in the first item of a font shorthand: the family words at its
// end, e.g. `Roboto Condensed` in `bold 12px/1.5 Roboto Condensed`. Sizes,
// functions such as calc() or var(), numbers and line heights end the family.
// Without one of them, leading style, weight and size keywords are not part of
// the family either, e.g. `bold large Roboto`.
const shorthandFamily = (item) => {
	const words = splitWords(item);
	let start = words.length;
	while (
		start > 0 &&
		isFamilyWord(words[start - 1]) &&
		// a word after `/` is the line height, e.g. `normal` in `12px / normal`
		!(start > 1 && words[start - 2].endsWith('/'))
	) {
		start--;
	}
	if (start === 0) {
		while (start < words.length && shorthandKeywords.has(words[start].toLowerCase())) {
			start++;
		}
	}
	return words.slice(start).join(' ');
};

// CSS-wide keywords, which are not valid as unquoted family names
const cssWideKeywords = new Set([ 'inherit', 'initial', 'unset', 'revert', 'revert-layer', 'default' ]);
// a CSS function such as var(--brand), whose parentheses splitWords balanced
const cssFunction = /^[\w-]+\([^]*\)$/;

// a family name as given if it is valid unquoted CSS (identifiers, or a
// function such as var()), and quoted otherwise, e.g. "M+ 1p"
const formatFamily = (name) => {
	const valid =
		quotedName.test(name) ||
		(!cssWideKeywords.has(name.toLowerCase()) &&
			splitWords(name).every((word) => identifier.test(word) || cssFunction.test(word)));
	if (valid) {
		return name;
	}
	return `"${name.replace(/["\\]/g, '\\$&').replace(/\n/g, '\\a ')}"`;
};

// replace system-ui in a declaration value with the given fallback list
const createReplacer = (familyNames) => {
	const systemUiFamily = familyNames.map(formatFamily);
	const fallbackKeys = systemUiFamily.map(familyKey);
	// names dropped after system-ui, as they are moved into the fallback list:
	// the fallbacks (e.g. from a previous run or a hand-written stack) except
	// generic keywords, and repeated system-ui
	const movedKeys = new Set(fallbackKeys.filter((key) => !genericFamilies.has(key)));
	movedKeys.add('system-ui');

	return (value, prop) => {
		// font-family holds only family names; the font shorthand (and custom
		// properties, which may hold one) can have other tokens before the first
		const familyOnly = /^font-family$/i.test(prop);
		const items = splitList(value);
		let index = -1;
		let offset = -1;
		while (offset === -1 && ++index < items.length) {
			offset = systemUiOffset(items[index], !familyOnly && index === 0);
		}
		if (offset === -1) {
			return value;
		}
		const head = items.slice(0, index);
		const rest = items
			.slice(index + 1)
			.filter((item) => !movedKeys.has(familyKey(item)));

		// families already listed before system-ui; in a font shorthand, the
		// first one follows the style, weight and size
		const headFamilies = head.slice();
		if (head.length && !familyOnly) {
			headFamilies[0] = shorthandFamily(head[0]);
		}
		const headKeys = new Set(headFamilies.map(familyKey));
		const restKeys = new Set(rest.map(familyKey));
		// skip fallbacks listed before system-ui, and generic keywords listed after
		// it, so they don't hide the families in between
		const fallback = systemUiFamily.filter((name, i) => {
			const key = fallbackKeys[i];
			return !headKeys.has(key) && !(genericFamilies.has(key) && restKeys.has(key));
		});

		const item = items[index];
		const prefix = item.slice(0, offset);
		if (!fallback.length) {
			// every fallback is already listed around system-ui: drop system-ui
			if (head.length) {
				return [ ...head, ...rest ].join(',');
			}
			if (rest.length) {
				const [ first, ...others ] = rest;
				return [ `${prefix}${first.replace(leadingWhitespace, '')}`, ...others ].join(',');
			}
		}
		const names = fallback.length ? fallback : systemUiFamily;
		// keep the whitespace before the next comma, taken from the end of the
		// run that is replaced: system-ui and the listed fallbacks right after it
		let runEnd = index;
		while (runEnd + 1 < items.length && movedKeys.has(familyKey(items[runEnd + 1]))) {
			runEnd++;
		}
		const [ suffix = '' ] = items[runEnd].match(trailingWhitespace) || [];
		return [ ...head, `${prefix}${names.join(', ')}${suffix}`, ...rest ].join(',');
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
			return names.concat(splitFamilyNames(entry));
		}, [])
		.map((name) => name.trim())
		.filter(Boolean);
};


// split a family option string on commas. A quote only starts a quoted name at
// the start of a name, and parentheses only group a function such as var(), so
// apostrophes and parentheses inside unquoted names are plain characters. An
// unclosed quote or function ends at the next comma.
const splitFamilyNames = (value) => {
	const names = [];
	let start = 0;
	while (start <= value.length) {
		const end = familyNameEnd(value, start);
		names.push(value.slice(start, end));
		start = end + 1;
	}
	return names;
};

// the index of the comma ending the family name at `start`, or the length
const familyNameEnd = (value, start) => {
	let i = start;
	while (i < value.length && whitespaceChar.test(value[i])) {
		i++;
	}
	let quote = value[i] === '"' || value[i] === '\'' ? value[i++] : '';
	let depth = 0;
	for (; i < value.length; i++) {
		const char = value[i];
		if (char === '\\') {
			i++;
		} else if (quote) {
			if (char === quote) {
				quote = '';
			}
		} else if (char === '(' && /[\w-]/.test(value[i - 1])) {
			depth++;
		} else if (char === ')' && depth > 0) {
			depth--;
		} else if (char === ',' && depth === 0) {
			return i;
		}
	}
	if (quote || depth > 0) {
		const comma = value.indexOf(',', start);
		return comma === -1 ? value.length : comma;
	}
	return value.length;
};
