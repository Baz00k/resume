export const exportToPDF = () => {
	// change print page size to #resume div size to avoid page break
	const resume = document.querySelector('#resume');

	if (!resume) {
		console.error('No resume element found');
		return;
	}

	const { width, height } = resume.getBoundingClientRect();

	const resumeWidth = Math.ceil(width);
	const resumeHeight = Math.ceil(height * 1.005);

	const style = document.createElement('style');
	style.innerHTML = `@page { size: ${resumeWidth}px ${resumeHeight}px; margin: 0; }`;

	document.head.appendChild(style);

	window.print();

	style.remove();
};
