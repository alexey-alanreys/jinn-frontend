/**
 * @module validateConfig
 * @description
 * Utility function to validate the structure of a configuration object.
 */

/**
 * Validates that an object contains all required keys.
 *
 * @param {Object<string, any>} config - Configuration object to validate.
 * @param {Array<string>} requiredKeys - Keys that must be present.
 * @returns {boolean} True if config contains all required keys.
 */
export function validateConfig(config, requiredKeys = []) {
	if (!config || typeof config !== 'object' || Array.isArray(config)) {
		return false;
	}

	return requiredKeys.every((key) => key in config);
}
