/**
 * @module numberStep
 * @description
 * Utility function to calculate the appropriate "step" attribute
 * for input[type=number] based on the decimal precision
 * of the provided numeric value.
 */

/**
 * Calculates an appropriate step value for an input[type=number] element
 * based on the number of decimal places in the provided numeric value.
 *
 * Examples:
 * - 100  => 1
 * - 17.9   => 0.1
 * - 0.075  => 0.001
 *
 * @param {number} value Numeric value to determine the step for.
 * @returns {number} Step value to be used in input element.
 */
export function calculateStep(value) {
	if (value === 0) return 1;

	const valueStr = value.toString();

	if (!valueStr.includes('.')) {
		return 1;
	}

	const decimalPart = valueStr.split('.')[1];
	const decimalPlaces = decimalPart.length;

	return Math.pow(10, -decimalPlaces);
}
