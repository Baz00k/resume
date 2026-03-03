export const browserType = {
	Chrome: 'Chrome',
	Chromium: 'Chromium',
	Firefox: 'Firefox',
	Safari: 'Safari',
	Other: 'Other'
} as const;

export type BrowserType = (typeof browserType)[keyof typeof browserType];

export const getBrowserInfo = (): { type: BrowserType; mobile: boolean } => {
	const userAgent = navigator.userAgent;
	const mobile = /Mobi/.test(userAgent);

	if (userAgent.includes('Chrome')) {
		return { type: browserType.Chrome, mobile };
	}

	if (userAgent.includes('Chromium')) {
		return { type: browserType.Chromium, mobile };
	}

	if (userAgent.includes('Firefox')) {
		return { type: browserType.Firefox, mobile };
	}

	if (userAgent.includes('Safari')) {
		return { type: browserType.Safari, mobile };
	}

	return { type: browserType.Other, mobile };
};
