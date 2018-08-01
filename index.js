// tooling
import postcss from 'postcss';

// plugin
export default postcss.plugin('postcss-system-ui-font', opts => {
	const familyOpt = Object(opts).family;

	const systemUiFamily = typeof familyOpt === 'string'
		? familyOpt.trim().split(/\s*,\s*/)
	: familyOpt || [
		'system-ui',
		'-apple-system', // macOS, Safari >= 9.2 < 11, Firefox >= 43
		'BlinkMacSystemFont', // macOS, Chrome < 56
		'Segoe UI', // Windows >= Vista
		'Roboto', // Android >= 4
		'Noto Sans', // Plasma >= 5.5
		'Ubuntu', // Ubuntu >= 10.10
		'Cantarell', // GNOME >= 3
		'Helvetica Neue'
	];

	// system-ui and fallbacks match
	const whitespace = '[\\f\\n\\r\\x09\\x20]';
	const systemUiMatch = new RegExp(`(^|,|${whitespace}+)(?:system-ui${whitespace}*)(?:,${whitespace}*(?:${systemUiFamily.join('|')})${whitespace}*)?(,|$)`, 'i');

	// system-ui fallback replacement
	const systemUiReplace = `$1${systemUiFamily.join(', ')}$2`;

	return root => {
		// update font declarations to polyfill system-ui usage
		root.walkDecls(fontPropertyMatch, decl => {
			decl.value = decl.value.replace(systemUiMatch, systemUiReplace);
		});
	};
});

// font and font family property match
const fontPropertyMatch = /^font(-family)?$/i;
