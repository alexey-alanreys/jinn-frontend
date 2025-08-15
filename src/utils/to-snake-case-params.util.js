/**
 * @module toSnakeCaseParams
 * @description
 * Utility function to convert the keys of an object from camelCase
 * to snake_case. Useful for adapting frontend parameter naming conventions
 * (JS style) to backend API query parameter formats (commonly snake_case).
 */

/**
 * Converts object keys from camelCase to snake_case.
 *
 * Examples:
 * - { updatedAfter: 1692172800 } => { updated_after: 1692172800 }
 * - { limit: 100, sinceId: 1407060 } => { limit: 100, since_id: 1407060 }
 *
 * @param {Object<string, any>} obj Object whose keys should be converted.
 * @returns {Object<string, any>} New object with snake_case keys.
 */
export function toSnakeCaseParams(obj) {
	if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
		throw new TypeError('Expected a plain object');
	}

	return Object.fromEntries(
		Object.entries(obj).map(([key, value]) => [
			key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
			value,
		]),
	);
}
