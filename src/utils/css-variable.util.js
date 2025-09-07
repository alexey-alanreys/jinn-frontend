/**
 * @module cssVariable
 * @description
 * Utility functions for working with CSS variables in JavaScript.
 */

/**
 * Retrieves the computed value of a CSS custom property (variable)
 * from the root element (document.documentElement).
 *
 * @param {string} name The name of the CSS variable.
 * @returns {string|null} The computed value of the CSS variable,
 *          or null if the variable is not defined.
 */
export function getCssVariable(name) {
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();

	return value || null;
}
