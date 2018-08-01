// tooling
import postcss from 'postcss';
import getSystemUiFamily from './lib/get-system-ui-family';
import browserslist from 'browserslist';

// plugin
export default postcss.plugin('postcss-system-ui-font', opts => {

	return (root, result) => {

		const family = Object(opts).family;
		let systemUiFamily = family;
		if (typeof family === 'string') {
			systemUiFamily = family.trim().split(/\s*,\s*/);
		} else if (!family) {

			const { browsers } = Object(opts);

			// browsers supported by the configuration
			const supportedBrowsers = browserslist(browsers, {
				path: result.root.source && result.root.source.input && result.root.source.input.file,
				ignoreUnknownVersions: true
			});
			systemUiFamily = getSystemUiFamily(supportedBrowsers);
		}

		// system-ui and fallbacks match
		const whitespace = '[\\f\\n\\r\\x09\\x20]';
		const systemUiMatch = new RegExp(`(^|,|${whitespace}+)(?:system-ui${whitespace}*)(?:,${whitespace}*(?:${systemUiFamily.join('|')})${whitespace}*)?(,|$)`, 'i');

		// system-ui fallback replacement
		const systemUiReplace = `$1${systemUiFamily.join(', ')}$2`;

		// update font declarations to polyfill system-ui usage
		root.walkDecls(fontPropertyMatch, decl => {
			decl.value = decl.value.replace(systemUiMatch, systemUiReplace);
		});
	};
});

// font and font family property match
const fontPropertyMatch = /^font(-family)?$/i;
