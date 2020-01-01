module.exports = {
		'basic': {
			message: 'supports basic usage'
		},
		'basic:family': {
			message: 'supports { family } usage',
			options: {
				family: 'system-ui, Segoe UI, Roboto, Helvetica Neue'
			}
		},
		'basic:browser:chrome_60': {
			message: 'supports simple { browsers } usage',
			options: {
				browsers: ["Chrome 60"]
			}
		},
		'basic:browser:whole_coverage': {
			message: 'supports complex { browsers } usage',
			options: {
				browsers: ["Safari 9", "Safari 10", "IE 11", "Chrome 55", "Chrome 56", "Firefox 57"]
			}
		},
		'basic:browser:edged_version': {
			message: 'supports browsers usage when caniuse is out-of-dated',
			options: {
				browsers: ["Chrome 1048576"]
			}
		},
		'basic:not_preserve': {
			message: 'supports simple { preserve } usage',
			options: {
				preserve: false,
			}
		},
		'custom-properties': {
			message: 'supports custom-properties usage'
		}
};
