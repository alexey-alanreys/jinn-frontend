/**
 * @module exportConfigs
 * @description
 * Utility function to export a JavaScript object (configs).
 */

/**
 * Exports a JavaScript object as a downloadable JSON file.
 *
 * @param {Object<string, any>} configs - The configs object to export.
 * @param {string} [fileName='configs.json'] - The name of the output file.
 * @returns {boolean} True if export was successful, false otherwise.
 */
export function exportConfigs(configs, fileName = 'configs.json') {
	if (!configs || typeof configs !== 'object' || Array.isArray(configs)) {
		console.warn('Export failed: Invalid configs object');
		return false;
	}

	try {
		const jsonStr = JSON.stringify(configs, null, 2);
		const blob = new Blob([jsonStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		link.style.display = 'none';

		document.body.appendChild(link);
		link.click();

		setTimeout(() => {
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}, 100);

		return true;
	} catch (error) {
		console.error('Failed to export configs:', error);
		return false;
	}
}
