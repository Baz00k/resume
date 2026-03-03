import { browserType, getBrowserInfo } from '$lib/browserInfo';

export const exportToPDF = (element: Element) => {
	const style = document.createElement('style');
	const browserInfo = getBrowserInfo();

	if (browserInfo.mobile === true) {
		// This should never happen, as the button should be hidden on mobile
		alert('PDF export is not supported on mobile devices');
		return;
	}

	switch (browserInfo.type) {
		case browserType.Safari:
			style.textContent = getSafariPrintStyle();
			break;

		default:
			style.textContent = getOnePagePrintStyles(element);
			break;
	}

	document.head.appendChild(style);
	window.print();
	style.remove();
};

const getOnePagePrintStyles = (element: Element) => {
	// Print the element as one big page
	const { width, height } = element.getBoundingClientRect();
	const pageWidth = Math.ceil(width);
	const pageHeight = Math.ceil(height * 1.005); // Height is increased by 0.5% to avoid page break

	return `
		@page {
			size: ${pageWidth}px ${pageHeight}px;
			margin: 0;
		}
	`;
};

const getSafariPrintStyle = () => {
	// Safari ignores absolutely everything, so we can only hope for the best

	return `
		@page {
			margin: 0;
			size: auto;
			page-break-inside: avoid;
		}
	`;
};
