import * as caniuse from 'caniuse-lite';

const NO = 'No';
const APPLE_SYSTEM = 'AppleSystem';
const BLINK_MAC_SYSTEM_FONT = 'BlinkMacSystemFont';

function computePolyfillFlagFromStatus(statusString) {
	const flags = [];
	const statusArr = statusString.split(' ');
	for (const status of statusArr) {
		if (status === 'y') {
			return [];
		} else if (status.includes('n')) {
			flags.push(NO);
		} else if (status.includes('#1')) { // #1: Supported as the -apple-system value (only on Mac)
			flags.push(APPLE_SYSTEM)
		} else if (status.includes('#2')) { // #2: Supported as the 'BlinkMacSystemFont' value (only on Mac)
			flags.push(BLINK_MAC_SYSTEM_FONT)
		}
	}
	return flags;

}

function generatePolyfillFlags(stats, supportedBrowsers) {
	const polyfillFlags = { [APPLE_SYSTEM]: false, [BLINK_MAC_SYSTEM_FONT]: false, [NO]: false };
	const visitedStatus = {};
	for (const browserAndVersion of supportedBrowsers) {
		const [browser, version] = browserAndVersion.split(' ');
		const status = stats[browser][version];
		if (status === undefined || visitedStatus[status]) {
			continue;
		}
		visitedStatus[status] = true;
		const shouldPolyfillFlags = computePolyfillFlagFromStatus(status);
		shouldPolyfillFlags.forEach(flag => { polyfillFlags[flag] = true });
	}
	return polyfillFlags;
}

export default function getSystemUiFamily(supportedBrowsers) {
	const { stats } = caniuse.feature(caniuse.features['font-family-system-ui']);
	const polyfillFlags = generatePolyfillFlags(stats, supportedBrowsers);

	const result = ['system-ui'];
	const polyfill =
		[
			[APPLE_SYSTEM, [
				'-apple-system', // macOS, Safari >= 9.2 < 11, Firefox >= 43
			]],
			[BLINK_MAC_SYSTEM_FONT, [
				'BlinkMacSystemFont', // macOS, Chrome < 56
			]],
			[NO, [
				'Segoe UI', // Windows >= Vista
				'Roboto', // Android >= 4
				'Noto Sans', // Plasma >= 5.5
				'Ubuntu', // Ubuntu >= 10.10
				'Cantarell', // GNOME >= 3
				'Helvetica Neue'
			]],
		];
	return result.concat.apply(result, polyfill.filter(([flag]) => polyfillFlags[flag]).map(v => v[1]));
}
