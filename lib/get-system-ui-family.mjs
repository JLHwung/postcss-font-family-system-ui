import * as caniuse from 'caniuse-lite';

const NO = 'No';
const APPLE_SYSTEM = 'AppleSystem';
const BLINK_MAC_SYSTEM_FONT = 'BlinkMacSystemFont';

// Browsers that only run on Apple platforms. For the others, support that is
// "only on Mac" (#1, #2) still needs the generic fallbacks everywhere else.
const APPLE_ONLY_BROWSERS = new Set([ 'safari', 'ios_saf' ]);

function computePolyfillFlagFromStatus(statusString) {
	const flags = [];
	const statusArr = Array.from(statusString.split(' '));
	for (const status of statusArr) {
		if (status === 'y') {
			return [];
		} else if (status.includes('n') || status === 'u') {
			// u: support unknown, polyfill as if unsupported
			flags.push(NO);
		} else if (status.includes('#1')) {
			// #1: Supported as the -apple-system value (only on Mac)
			flags.push(APPLE_SYSTEM);
		} else if (status.includes('#2')) {
			// #2: Supported as the 'BlinkMacSystemFont' value (only on Mac)
			flags.push(BLINK_MAC_SYSTEM_FONT);
		}
	}
	return flags;
}

function computePolyfillFlags(browser, status) {
	const flags = computePolyfillFlagFromStatus(status);
	// unknown support (e.g. Safari 9) in an Apple-only browser: -apple-system
	// may work, and does no harm where it doesn't
	if (status.split(' ').includes('u') && APPLE_ONLY_BROWSERS.has(browser)) {
		flags.push(APPLE_SYSTEM);
	}
	const macOnly = flags.includes(APPLE_SYSTEM) || flags.includes(BLINK_MAC_SYSTEM_FONT);
	if (macOnly && !APPLE_ONLY_BROWSERS.has(browser)) {
		flags.push(NO);
	}
	return flags;
}

function generatePolyfillFlags(stats, supportedBrowsers) {
	const polyfillFlags = {
		[APPLE_SYSTEM]: false,
		[BLINK_MAC_SYSTEM_FONT]: false,
		[NO]: false,
	};
	const visitedStatus = {};
	for (const browserAndVersion of supportedBrowsers) {
		const [ browser, version ] = browserAndVersion.split(' ');
		const status = stats[browser]?.[version];
		if (status === undefined) {
			continue;
		}
		const statusKey = `${APPLE_ONLY_BROWSERS.has(browser)} ${status}`;
		if (visitedStatus[statusKey]) {
			continue;
		}
		visitedStatus[statusKey] = true;
		const shouldPolyfillFlags = computePolyfillFlags(browser, status);
		shouldPolyfillFlags.forEach((flag) => {
			polyfillFlags[flag] = true;
		});
	}
	return polyfillFlags;
}

// caniuse data is unpacked on first use and reused, as this runs per CSS file
let systemUiStats;

export default function getSystemUiFamily(supportedBrowsers, preserve) {
	systemUiStats ??= caniuse.feature(caniuse.features['font-family-system-ui']).stats;
	const stats = systemUiStats;
	const polyfillFlags = generatePolyfillFlags(stats, supportedBrowsers);

	const polyfill = [
		[
			APPLE_SYSTEM,
			[
				'-apple-system', // macOS, Safari >= 9.2 < 11, Firefox >= 43
			],
		],
		[
			BLINK_MAC_SYSTEM_FONT,
			[
				'BlinkMacSystemFont', // macOS, Chrome < 56
			],
		],
		[
			NO,
			[
				'Segoe UI', // Windows >= Vista
				'Roboto', // Android >= 4
				'Noto Sans', // Plasma >= 5.5
				'Ubuntu', // Ubuntu >= 10.10
				'Cantarell', // GNOME >= 3
				'Helvetica Neue',
			],
		],
	];
	const result = [].concat.apply(
		[],
		polyfill.filter(([ flag ]) => polyfillFlags[flag]).map((v) => v[1])
	);
	if (!result.length || preserve) {
		result.unshift('system-ui');
	}
	return result;
}
