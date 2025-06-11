/**
 * @module query
 * @description
 * `query` is a lightweight utility library for DOM manipulation,
 * providing a simple API for interacting with the DOM.
 */

/**
 * A class for DOM manipulation.
 */
class Query {
	/**
	 * Initializes a new instance of the Query class.
	 *
	 * @param {string | HTMLElement} selector
	 * - A CSS selector string or an HTMLElement. If a string is provided,
	 * the first matching element in the DOM will be selected.
	 * If an HTMLElement is provided, it will be used directly.
	 * @throws {Error} Throws an error if the selector is invalid
	 * or if no element is found for a string selector.
	 */
	constructor(selector) {
		if (typeof selector === 'string') {
			this.element = document.querySelector(selector);

			if (!this.element) {
				throw new Error(`No element found for the selector: "${selector}"`);
			}
		} else if (selector instanceof HTMLElement) {
			this.element = selector;
		} else {
			throw new Error(
				'The selector must be a string or an instance of HTMLElement.',
			);
		}
	}

	/* FIND */

	/**
	 * Finds the first element that matches the specified selector
	 * within the current element.
	 *
	 * @param {string} selector
	 * - A CSS selector string to search for within the current element.
	 * @throws {Error} Throws an error
	 * if no element matching the selector is found.
	 * @returns {Query} A new Query instance wrapping the found element.
	 */
	find(selector) {
		const element = new Query(this.element.querySelector(selector));

		if (element) {
			return element;
		} else {
			throw new Error(`No element found for the selector: "${selector}"`);
		}
	}

	/**
	 * Find all elements that match the specified selector
	 * within the selected element.
	 * @param {string} selector
	 * - A CSS selector string to search for within the selected element.
	 * @returns {RQuery[]} An array of new Query instances
	 * for the found elements.
	 */
	findAll(selector) {
		const elements = this.element.querySelectorAll(selector);
		return Array.from(elements).map((el) => new Query(el));
	}

	/* INSERT */

	/**
	 * Appends a new child element to the current element.
	 *
	 * @param {HTMLElement} childElement
	 * - The child element to append.
	 * @throws {Error} Throws an error
	 * if the provided childElement is not an instance of HTMLElement.
	 * @returns {Query} The current Query instance for method chaining.
	 */
	append(childElement) {
		if (!(childElement instanceof HTMLElement)) {
			throw new Error(
				'The provided childElement must be an instance of HTMLElement.',
			);
		}

		this.element.appendChild(childElement);
		return this;
	}

	/**
	 * Inserts a new element immediately before the current element in the DOM.
	 *
	 * @param {HTMLElement} newElement
	 * - The new element to insert.
	 * @throws {Error} Throws an error
	 * if the provided newElement is not an instance of HTMLElement or
	 * if the current element
	 * does not have a parent element.
	 * @returns {Query} The current Query instance for method chaining.
	 */
	before(newElement) {
		if (!(newElement instanceof HTMLElement)) {
			throw new Error(
				'The provided newElement must be an instance of HTMLElement.',
			);
		}

		const parentElement = this.element.parentElement;

		if (!parentElement) {
			throw new Error('The current element does not have a parent element.');
		}

		parentElement.insertBefore(newElement, this.element);
		return this;
	}

	/**
	 * Gets or sets the inner HTML content of the current element.
	 *
	 * @param {string} [htmlContent]
	 * - The HTML content to set.
	 * If omitted, the method will return the current inner HTML of the element.
	 * @returns {Query | string} The current Query instance for method chaining
	 * when setting HTML content, or the current inner HTML when getting.
	 */
	html(htmlContent) {
		if (typeof htmlContent === 'undefined') {
			return this.element.innerHTML;
		} else {
			this.element.innerHTML = htmlContent;
			return this;
		}
	}

	/**
	 * Get or set the text content of the selected element.
	 *
	 * @param {string} [textContent]
	 * - Optional text content to set.
	 * If not provided, the current text content will be returned.
	 * @returns {Query | string} The current Query instance for method
	 * chaining when setting text content, or the current text content.
	 */
	text(textContent) {
		if (typeof textContent === 'undefined') {
			return this.element.textContent;
		} else {
			this.element.textContent = textContent;
			return this;
		}
	}

	/* EVENTS */

	/**
	 * Adds a click event listener to the current element.
	 *
	 * @param {function(Event): void} callback
	 * - The function to execute when the element is clicked.
	 * The callback receives the event object as its argument.
	 * @returns {Query} The current Query instance for method chaining.
	 */
	click(callback) {
		this.element.addEventListener('click', callback);
		return this;
	}

	/* FORM */

	/**
	 * Sets attributes and event listeners for an input element.
	 * @param {Object} options
	 * - An object containing input options.
	 * @param {function(Event): void} [options.onInput]
	 * - Function to be called when the input event occurs.
	 * @param {Object} [options.rest]
	 * - Optional attributes to set on the input element.
	 * @throws {Error} If the current element is not an input element.
	 * @returns {Query} The current Query instance for method chaining.
	 */
	input({ onInput, ...rest }) {
		if (this.element.tagName.toLowerCase() !== 'input') {
			throw new Error('Element must be an input.');
		}

		for (const [key, value] of Object.entries(rest)) {
			this.element.setAttribute(key, value);
		}

		if (onInput) {
			this.element.addEventListener('input', onInput);
		}

		return this;
	}

	/* STYLES */

	/**
	 * Sets a CSS property to a specified value for the current element.
	 *
	 * @param {string} property
	 * - The name of the CSS property to set.
	 * @param {string} value
	 * - The value to assign to the CSS property.
	 * @throws {Error} Throws an error if the property or value is not a string.
	 * @returns {Query} The current Query instance for method chaining.
	 */
	css(property, value) {
		if (typeof property !== 'string' || typeof value !== 'string') {
			throw new Error('Both "property" and "value" must be strings.');
		}

		this.element.style[property] = value;
		return this;
	}

	/**
	 * Adds one or more CSS classes to the current element.
	 *
	 * @param {string | string[]} classNames
	 * - A single class name as a string or an array of class names to add.
	 * If an array is provided, each class
	 * name in the array will be added to the element.
	 * @throws {Error} Throws an error if the provided classNames is neither
	 * a string nor an array of strings.
	 * @returns {Query} The current Query instance for method chaining.
	 */
	addClass(classNames) {
		if (Array.isArray(classNames)) {
			for (const className of classNames) {
				this.element.classList.add(className);
			}
		} else if (typeof classNames === 'string') {
			this.element.classList.add(classNames);
		} else {
			throw new Error(
				'The "classNames" parameter must be a string or an array of strings.',
			);
		}

		return this;
	}

	/**
	 * Removes one or more CSS classes from the element.
	 *
	 * @param {string | string[]} classNames
	 * - The class name(s) to remove.
	 * Can be a single class name as a string or an array of class names.
	 * @returns {this} The current Query instance for method chaining.
	 */
	removeClass(classNames) {
		if (Array.isArray(classNames)) {
			for (const className of classNames) {
				this.element.classList.remove(className);
			}
		} else {
			this.element.classList.remove(classNames);
		}

		return this;
	}

	/**
	 * Set or get the value of an attribute on the selected element.
	 *
	 * @param {string} attributeName
	 * - The name of the attribute to set or get.
	 * @param {string} [value]
	 * - The value to set for the attribute.
	 * If not provided, the current value of the attribute will be returned.
	 * @returns {Query|string} The current Query instance for method chaining
	 * (if setting) or the attribute value (if getting).
	 */
	attr(attributeName, value) {
		if (typeof attributeName !== 'string') {
			throw new Error('Attribute name must be a string.');
		}

		if (typeof value === 'undefined') {
			return this.element.getAttribute(attributeName);
		} else {
			this.element.setAttribute(attributeName, value);
			return this;
		}
	}

	/**
	 * Removes an attribute from the current element.
	 * @param {string} attrName
	 * - The name of the attribute to remove.
	 * @return {RQuery} Returns the RQuery instance.
	 */
	removeAttr(attrName) {
		if (typeof attrName !== 'string') {
			throw new Error('attrName must be a string');
		}

		this.element.removeAttribute(attrName);
		return this;
	}
}

/**
 * Creates a new Query instance for the specified selector or element.
 *
 * @param {string | HTMLElement} selector
 * - A CSS selector string or an HTMLElement.
 * @returns {Query} A new Query instance wrapping the selected element.
 */
export const $Q = (selector) => new Query(selector);
