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
		// with `preserve: false`, drop system-ui unless it is the only name
		const withoutSystemUi = familyOption.filter((name) => familyKey(name) !== 'system-ui');
		fixedReplacer = createReplacer(
			!preserve && withoutSystemUi.length ? withoutSystemUi : familyOption
		);
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
			const visited = new WeakSet();
			return {
				// update font declarations to polyfill system-ui usage
				Declaration(decl) {
					if (
						decl.prop.match(fontPropertyMatch) &&
						!visited.has(decl) &&
						!isFontFaceDescriptor(decl) &&
						systemUiPresent.test(decl.value)
					) {
						// look up the config only for declarations that use system-ui,
						// from their own file, e.g. CSS inlined by postcss-import
						const replace = getReplacer(
							Object(decl.source).input?.file ||
								result.opts.from ||
								Object(result.root.source).input?.file
						);
						// PostCSS keeps comments next to other tokens in the value, and
						// leaves the spaces around the ones it removes (`raws.value`)
						const value = decl.raws.value
							? stripComments(decl.value).replace(/([^\s]) {2,}(?=[^\s])/g, '$1 ')
							: stripComments(decl.value);
						const replaced = replace(value, decl.prop);
						if (replaced !== value) {
							decl.value = replaced;
						}
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

// @font-face takes a single family name, which must not become a list
const isFontFaceDescriptor = (decl) =>
	Object(decl.parent).type === 'atrule' && /^font-face$/i.test(decl.parent.name);

const tokenDelimiter = /[\s,/()]/;

// remove comments (outside of strings), keeping the tokens around them apart
const stripComments = (value) => {
	if (!value.includes('/*')) {
		return value;
	}
	let result = '';
	let quote = '';
	for (let i = 0; i < value.length; i++) {
		const char = value[i];
		if (char === '\\') {
			result += value.slice(i, i + 2);
			i++;
		} else if (quote) {
			quote = char === quote ? '' : quote;
			result += char;
		} else if (char === '"' || char === '\'') {
			quote = char;
			result += char;
		} else if (char === '/' && value[i + 1] === '*') {
			const end = value.indexOf('*/', i + 2);
			i = end === -1 ? value.length : end + 1;
			// keep two tokens apart, e.g. `12px/**/system-ui`, but don't leave two
			// spaces, e.g. `Arial, /* x */ system-ui`
			const before = result[result.length - 1];
			const after = value[i + 1];
			if (before && after && !tokenDelimiter.test(before) && !tokenDelimiter.test(after)) {
				result += ' ';
			} else if (before && after && whitespaceChar.test(before) && whitespaceChar.test(after)) {
				i++;
			}
		} else {
			result += char;
		}
	}
	return result;
};

// cheap check before looking up the config and parsing the value
const systemUiPresent = /system-ui/i;
const whitespaceChar = /[\f\n\r\t ]/;
const trailingWhitespace = /[\f\n\r\t ]+$/;
const leadingWhitespace = /^[\f\n\r\t ]+/;
// a quoted string with no unescaped closing quote inside
const quotedName = /^(["'])((?:\\[^]|(?!\1)[^\\])*)\1$/;

// the generic families every browser supports, which always match a font, so
// families after them are never used
const classicGenericFamilies = new Set([ 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy' ]);

// all generic family keywords
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
	string.replace(/\\(?:([0-9a-f]{1,6})(?:\r\n|[\t\n\f\r ])?|([^]))/gi, (match, hex, char) => {
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
		quoted
			? unescapeCss(quoted[2])
			: unescapeCss(trimmed.replace(/\\[^]|\s+/g, (match) => (match[0] === '\\' ? match : ' ')))
	).toLowerCase();
	return quoted && genericFamilies.has(name) ? `"${name}"` : name;
};

// the offset of an unquoted system-ui ending a list item, or -1. Only the first
// item of a font shorthand may have other tokens (style, weight, size) before
// it, and not a family-like word, as in the family `Foo system-ui`.
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
	if (!allowPrefix) {
		return -1;
	}
	const words = splitWords(prefix);
	let start = words.length;
	while (
		start > 0 &&
		shorthandKeywords.has(words[start - 1].toLowerCase()) &&
		!isLineHeightAt(words, start - 1)
	) {
		start--;
	}
	if (start < words.length) {
		// keywords, unless they follow a font size (`12px Normal system-ui`)
		return start > 0 && isSizeAt(words, start - 1) ? -1 : offset;
	}
	// a size or line height (`12px / normal`), not a family-like word
	return isFamilyWord(words[start - 1]) && !isSizeAt(words, start - 1) ? -1 : offset;
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
const identifier =
	/^(?:--|-?(?:[a-z_\u0080-\uffff]|\\[^\n\r\f]))(?:[\w\-\u0080-\uffff]|\\[^\n\r\f])*$/i;

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
	'math',
	'smaller',
]);

const isFamilyWord = (word) => quotedName.test(word) || identifier.test(word);

// a font size or line height: a length, percentage or math function, possibly
// with `/line-height`, or a line height after `/`; not an angle (`oblique 10deg`)
// or a plain number (a weight)
const isSizeWord = (word) => {
	const [ size ] = word.split('/');
	if (!size || word.endsWith('/')) {
		return true;
	}
	return (
		/^(?:calc|min|max|clamp)\(/i.test(size) ||
		(/^[+-]?(?:\d*\.)?\d+(?:%|[a-z]+)$/i.test(size) && !/(?:deg|grad|rad|turn)$/i.test(size))
	);
};

// whether words[i] is a line height: it follows `/`, e.g. `normal` in
// `12px / normal` or `12px/ normal`
const isLineHeightAt = (words, i) => i > 0 && words[i - 1].endsWith('/');

// whether words[i] is a font size or line height
const isSizeAt = (words, i) => isSizeWord(words[i]) || isLineHeightAt(words, i);

// the family in the first item of a font shorthand: the family words at its
// end, e.g. `Roboto Condensed` in `bold 12px/1.5 Roboto Condensed`. Sizes,
// functions such as calc() or var(), numbers and line heights end the family.
// Without one of them, leading style, weight and size keywords are not part of
// the family either (e.g. `bold large Roboto`), unless `stripKeywords` is false.
const shorthandFamily = (item, stripKeywords = true) => {
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
	// keywords right after a font size or line height are part of the family
	// (`12px Medium Sans`), otherwise they may be the size (`700 large Roboto`)
	if (stripKeywords && !(start > 0 && isSizeAt(words, start - 1))) {
		while (start < words.length && shorthandKeywords.has(words[start].toLowerCase())) {
			start++;
		}
	}
	return words.slice(start).join(' ');
};

// CSS-wide keywords, which are not valid as unquoted family names
const cssWideKeywords = new Set([ 'inherit', 'initial', 'unset', 'revert', 'revert-layer', 'default' ]);
// a function that can stand for family names, e.g. var(--brand); splitWords
// keeps its parentheses balanced
const cssFunction = /^(?:var|env|attr)\([^]*\)$/i;

// a family name as given if it is valid unquoted CSS (identifiers, or a
// function such as var()), and quoted otherwise, e.g. "M+ 1p"
const formatFamily = (name) => {
	if (quotedName.test(name)) {
		// a raw line break would end the string; an escaped one is a line
		// continuation, which stands for nothing
		return name.replace(/\\(?:\r\n|[\s\S])|\r\n|[\n\r\f]/g, (match) => {
			if (match[0] !== '\\') {
				return '\\a ';
			}
			return /^\\(?:\r\n|[\n\r\f])$/.test(match) ? '' : match;
		});
	}
	const words = splitWords(name);
	const valid =
		words.every(
			(word) =>
				(identifier.test(word) && !cssWideKeywords.has(word.toLowerCase())) ||
				cssFunction.test(word)
		);
	if (valid) {
		// identifiers are separated by single spaces, e.g. no line breaks
		return words.join(' ');
	}
	return `"${name.replace(/["\\]/g, '\\$&').replace(/\r\n|[\n\r\f]/g, '\\a ')}"`;
};

// replace system-ui in a declaration value with the given fallback list
const createReplacer = (familyNames) => {
	// the fallback list, without repeated names
	const keys = new Set();
	const fallbackList = [];
	familyNames.map(formatFamily).forEach((name) => {
		const key = familyKey(name);
		if (!keys.has(key)) {
			keys.add(key);
			fallbackList.push({ name, key, order: fallbackList.length });
		}
	});
	// system-ui keeps its place in the list, if it is in it (see `preserve`)
	const systemUiEntry = fallbackList.find(({ key }) => key === 'system-ui');
	// the fallbacks to add; system-ui itself is the item being replaced
	const fallbacks = fallbackList.filter(({ key }) => key !== 'system-ui');

	return (value, prop) => {
		// font-family holds only family names; the font shorthand (and custom
		// properties, which may hold one) can have other tokens before the first
		const familyOnly = /^font-family$/i.test(prop);
		const shorthand = /^font$/i.test(prop);
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
		// when system-ui is dropped (`preserve: false`), drop repeated ones too
		const rest = items
			.slice(index + 1)
			.filter((item) => systemUiEntry || familyKey(item) !== 'system-ui');

		// families already listed before system-ui; in a font shorthand, the
		// first one follows the style, weight and size
		const headFamilies = head.slice();
		if (head.length && !familyOnly) {
			headFamilies[0] = shorthandFamily(head[0], shorthand);
		}
		const headKeys = new Set(headFamilies.map(familyKey));
		const restKeys = rest.map(familyKey);
		const hasGeneric = [ ...headKeys, ...restKeys ].some((key) => classicGenericFamilies.has(key));
		// a classic generic family always matches a font, so fallbacks after it
		// are only used for characters that font lacks: insert them before it
		const firstGeneric = restKeys.findIndex((key) => classicGenericFamilies.has(key));
		const lastSlot = firstGeneric === -1 ? rest.length : firstGeneric;

		// Families the author listed keep their place. Each missing fallback is
		// inserted before the first listed fallback (or system-ui) that comes after
		// it in the fallback list, after the last listed one that comes before it,
		// or else right after system-ui, but never after a classic generic family
		// that follows system-ui. (A generic family before system-ui doesn't stop
		// them: browsers fall back per character, so they are still used for
		// characters its font lacks.)
		// Classic generic families are never used as such anchors; a missing one
		// is added at the end, unless the value already has one.
		// Anchor positions are indexes in `rest`; -1 is system-ui.
		const anchors = systemUiEntry ? [ { order: systemUiEntry.order, position: -1 } ] : [];
		const missing = [];
		fallbacks.forEach((fallback) => {
			const listed = restKeys.indexOf(fallback.key);
			// listed only after a classic generic family, where it isn't used
			const position = listed > lastSlot ? -1 : listed;
			if (headKeys.has(fallback.key)) {
				return;
			}
			if (position === -1) {
				missing.push(fallback);
			} else if (!classicGenericFamilies.has(fallback.key)) {
				anchors.push({ order: fallback.order, position });
			}
		});
		// names to insert before rest[slot]; slot -1 is before system-ui
		const inserts = new Map();
		const namesAt = (slot) => inserts.get(slot) || [];
		const insert = (slot, name) => inserts.set(slot, namesAt(slot).concat(name));
		missing.forEach(({ name, key, order }) => {
			if (classicGenericFamilies.has(key)) {
				if (!hasGeneric) {
					insert(rest.length, name);
				}
				return;
			}
			// right after the last listed fallback that comes before it, but not
			// after one that comes after it, nor after a classic generic family
			const slots = [ lastSlot ];
			anchors.forEach((anchor) => {
				if (anchor.order > order) {
					slots.push(anchor.position);
				}
			});
			const earlier = anchors.filter((anchor) => anchor.order < order);
			const slot = earlier.length ? Math.max(...earlier.map((anchor) => anchor.position)) + 1 : 0;
			insert(Math.min(slot, ...slots), name);
		});

		const item = items[index];
		const prefix = item.slice(0, offset);
		const [ suffix = '' ] = item.match(trailingWhitespace) || [];
		const systemUi = item.slice(offset, item.length - suffix.length);
		// system-ui, or what replaces it, with the names inserted around it
		const after = namesAt(0);
		const replaced = [ ...namesAt(-1), ...(systemUiEntry ? [ systemUi ] : []), ...after ];
		// keep a line break before the next comma, but not a stray space
		const keptSuffix = after.length && !/[\n\r\f]/.test(suffix) ? '' : suffix;
		const output = head.slice();
		if (replaced.length) {
			output.push(`${prefix}${replaced.join(', ')}${keptSuffix}`);
		} else if (!head.length && rest.length) {
			// system-ui is dropped from the start: keep the shorthand tokens before it
			rest[0] = `${prefix}${rest[0].replace(leadingWhitespace, '')}`;
		}
		rest.forEach((restItem, slot) => {
			if (slot > 0) {
				output.push(...namesAt(slot).map((name) => ` ${name}`));
			}
			output.push(restItem);
		});
		if (rest.length) {
			const appended = namesAt(rest.length).map((name) => ` ${name}`);
			if (appended.length) {
				// keep whitespace at the end of the value after the appended names
				const last = output.length - 1;
				const [ end = '' ] = output[last].match(trailingWhitespace) || [];
				output[last] = output[last].slice(0, output[last].length - end.length);
				appended[appended.length - 1] += end;
			}
			output.push(...appended);
		}
		return output.join(',');
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
		} else if (char === '(' && i > 0 && /[\w-]/.test(value[i - 1])) {
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
