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
	 * @param {string | HTMLElement | Document} selector A CSS selector string,
	 *        HTMLElement, or Document. If a string is provided,
	 *        the first matching element in the DOM will be selected.
	 *        If an HTMLElement or Document is provided,
	 *        it will be used directly.
	 * @throws {Error} If the selector is invalid
	 *         or if no element is found for a string selector.
	 */
	constructor(selector) {
		if (typeof selector === 'string') {
			this.element = document.querySelector(selector);

			if (!this.element) {
				throw new Error(`No element found for the selector: "${selector}"`);
			}
		} else if (selector instanceof Element || selector instanceof Document) {
			this.element = selector;
		} else {
			throw new Error(
				'The selector must be a string, HTMLElement, or Document',
			);
		}
	}

	/* FIND */

	/**
	 * Finds the first element that matches the specified selector
	 * within the current element.
	 *
	 * @param {string} selector A CSS selector string
	 *        to search for within the current element.
	 * @returns {Query} A new Query instance wrapping the found element.
	 * @throws {Error} If no element matching the selector is found.
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
	 *
	 * @param {string} selector A CSS selector string
	 *        to search for within the selected element.
	 * @returns {RQuery[]} An array of new Query instances
	 *          for the found elements.
	 */
	findAll(selector) {
		const elements = this.element.querySelectorAll(selector);
		return Array.from(elements).map((el) => new Query(el));
	}

	/**
	 * Finds the closest ancestor (or self) matching the selector.
	 *
	 * @param {string} selector A CSS selector to match.
	 * @returns {Query|null} A new Query instance wrapping the found element,
	 *          or null if no match found.
	 */
	closest(selector) {
		const found = this.element.closest(selector);
		return found ? new Query(found) : null;
	}

	/* INSERT */

	/**
	 * Appends a new child element to the current element.
	 *
	 * @param {HTMLElement} childElement The child element to append.
	 * @returns {Query} The current Query instance for method chaining.
	 * @throws {Error} If the provided childElement
	 *         is not an instance of HTMLElement.
	 */
	append(childElement) {
		if (!(childElement instanceof HTMLElement)) {
			throw new Error(
				'The provided childElement must be an instance of HTMLElement',
			);
		}

		this.element.appendChild(childElement);
		return this;
	}

	/**
	 * Prepends a new child element to the current element.
	 *
	 * @param {HTMLElement} childElement The child element to prepend.
	 * @returns {Query} The current Query instance for method chaining.
	 * @throws {Error} If the provided childElement
	 *         is not an instance of HTMLElement.
	 */
	prepend(childElement) {
		if (!(childElement instanceof HTMLElement)) {
			throw new Error(
				'The provided childElement must be an instance of HTMLElement',
			);
		}

		const first = this.element.firstChild;

		if (first) {
			this.element.insertBefore(childElement, first);
		} else {
			this.element.appendChild(childElement);
		}

		return this;
	}

	/**
	 * Inserts a new element immediately before the current element in the DOM.
	 *
	 * @param {HTMLElement} newElement The new element to insert.
	 * @returns {Query} The current Query instance for method chaining.
	 * @throws {Error} If the provided newElement
	 *         is not an instance of HTMLElement
	 *         or if the current element does not have a parent element.
	 */
	before(newElement) {
		if (!(newElement instanceof HTMLElement)) {
			throw new Error(
				'The provided newElement must be an instance of HTMLElement',
			);
		}

		const parentElement = this.element.parentElement;

		if (!parentElement) {
			throw new Error('The current element does not have a parent element');
		}

		parentElement.insertBefore(newElement, this.element);
		return this;
	}

	/**
	 * Gets or sets the inner HTML content of the current element.
	 *
	 * @param {string} [htmlContent] The HTML content to set.
	 *        If omitted, the method will return the current
	 *        inner HTML of the element.
	 * @returns {Query | string} The current Query instance for method chaining
	 *          when setting HTML content,
	 *          or the current inner HTML when getting.
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
	 * @param {string} [textContent] Optional text content to set.
	 *        If not provided, the current text content will be returned.
	 * @returns {Query | string} The current Query instance for method chaining
	 *          when setting text content, or the current text content.
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
	 * @param {function(Event): void} callback The function
	 *        to execute when the element is clicked.
	 *        The callback receives the event object as its argument.
	 * @returns {Query} The current Query instance for method chaining.
	 */
	click(callback) {
		this.element.addEventListener('click', callback);
		return this;
	}

	/**
	 * Add event listener to selected element.
	 *
	 * @param {string} eventType Event type ('click', 'input' etc.)
	 * @param {function(Event): void} callback Handler function
	 *        receiving event object
	 * @returns {RQuery} Current instance for chaining
	 * @throws {Error} If `eventType` is not a string
	 *         or `callback` is not a function.
	 */
	on(eventType, callback) {
		if (typeof eventType !== 'string' || typeof callback !== 'function') {
			throw new Error(
				'eventType must be a string and callback must be a function',
			);
		}

		this.element.addEventListener(eventType, callback);
		return this;
	}

	/**
	 * Remove event listener from selected element.
	 *
	 * @param {string} eventType Event type to remove.
	 * @param {function(Event): void} [callback] Optional callback to remove
	 * @returns {Query} Current instance for chaining.
	 * @throws {Error} If `eventType` is not a string.
	 */
	off(eventType, callback) {
		if (typeof eventType !== 'string') {
			throw new Error('eventType must be a string');
		}

		if (callback) {
			this.element.removeEventListener(eventType, callback);
		} else {
			if (this.element instanceof Document) {
				const newHandler = () => {};
				this.element.addEventListener(eventType, newHandler);
				this.element.removeEventListener(eventType, newHandler);
			} else {
				const newElement = this.element.cloneNode(true);
				this.element.parentNode.replaceChild(newElement, this.element);
				this.element = newElement;
			}
		}
		return this;
	}

	/**
	 * Dispatches a custom event on the current element.
	 *
	 * @param {string} eventName The name of the custom event.
	 * @param {Object} [detail] Optional data to pass with the event
	 *        (available in event.detail).
	 * @param {Object} [options] Optional event options
	 *        (bubbles, cancelable, composed).
	 * @returns {boolean} The return value is false if event is cancelable
	 *          and at least one of the event handlers called preventDefault(),
	 *          otherwise true.
	 *  @throws {Error} If `eventName` is not a string.
	 */
	trigger(eventName, detail = {}, options = {}) {
		if (typeof eventName !== 'string') {
			throw new Error('Event name must be a string');
		}

		const event = new CustomEvent(eventName, {
			detail,
			bubbles: options.bubbles ?? true,
			cancelable: options.cancelable ?? true,
			composed: options.composed ?? false,
		});

		return this.element.dispatchEvent(event);
	}

	/* FORM */

	/**
	 * Sets attributes and event listeners for an input element.
	 *
	 * @param {Object} options An object containing input options.
	 * @param {function(Event): void} [options.onInput] Function to be called
	 *        when the input event occurs.
	 * @param {Object} [options.rest] Optional attributes
	 *        to set on the input element.
	 * @returns {Query} The current Query instance for method chaining.
	 * @throws {Error} If the current element is not an input element.
	 */
	input({ onInput, ...rest }) {
		if (this.element.tagName.toLowerCase() !== 'input') {
			throw new Error('Element must be an input');
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
	 * Get or set CSS properties.
	 *
	 * @param {string|Object} prop Property name or object of properties.
	 * @param {string} [value] Value to set.
	 * @returns {Query|string} Current instance or property value.
	 * @throws {Error} If arguments are invalid
	 *         (e.g., prop is neither string nor object).
	 *
	 */
	css(prop, value) {
		if (typeof prop === 'string' && typeof value === 'undefined') {
			return window.getComputedStyle(this.element).getPropertyValue(prop);
		}

		if (typeof prop === 'object') {
			for (const [key, val] of Object.entries(prop)) {
				this.element.style[key] = val;
			}
		} else if (typeof prop === 'string' && value) {
			this.element.style[prop] = value;
		} else {
			throw new Error('Invalid arguments');
		}

		return this;
	}

	/**
	 * Set document cursor style.
	 * @param {string} cursorStyle CSS cursor value.
	 * @returns {Query}
	 */
	cursor(cursorStyle) {
		if (this.element === document) {
			document.body.style.cursor = cursorStyle;
		} else {
			this.element.style.cursor = cursorStyle;
		}
		return this;
	}

	/**
	 * Adds one or more CSS classes to the current element.
	 *
	 * @param {string | string[]} classNames A single class name as a string
	 *        or an array of class names to add. If an array is provided,
	 *        each class name in the array will be added to the element.
	 * @returns {Query} The current Query instance for method chaining.
	 * @throws {Error} If the provided classNames
	 *         is neither a string nor an array of strings.
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
				'The "classNames" parameter must be a string or an array of strings',
			);
		}

		return this;
	}

	/**
	 * Removes one or more CSS classes from the element.
	 *
	 * @param {string | string[]} classNames The class name(s) to remove.
	 *        Can be a single class name as a string or an array of class names.
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
	 * Checks if the element has the specified CSS class.
	 *
	 * @param {string} className The class name to check for.
	 * @returns {boolean} `true` if the element has the class, otherwise `false`.
	 * @throws {Error} If `className` is not a string.
	 */
	hasClass(className) {
		if (typeof className !== 'string') {
			throw new Error('Class name must be a string');
		}

		return this.element.classList.contains(className);
	}

	/**
	 * Set or get the value of an attribute on the selected element.
	 *
	 * @param {string} attributeName The name of the attribute to set or get.
	 * @param {string} [value] The value to set for the attribute.
	 *        If not provided, the current value of the attribute
	 *        will be returned.
	 * @returns {Query|string} The current Query instance for method chaining
	 *          (if setting) or the attribute value (if getting).
	 * @throws {Error} If `attributeName` is not a string.
	 */
	attr(attributeName, value) {
		if (typeof attributeName !== 'string') {
			throw new Error('Attribute name must be a string');
		}

		if (typeof value === 'undefined') {
			return this.element.getAttribute(attributeName);
		} else {
			this.element.setAttribute(attributeName, value);
			return this;
		}
	}

	/**
	 * Gets or sets a data attribute on the element.
	 *
	 * @param {string} key The data attribute name (without 'data-' prefix).
	 * @param {string} [value] The value to set.
	 *        If omitted, returns the current value.
	 * @returns {Query|string} The current Query instance (if setting)
	 *          or the data value (if getting).
	 * @throws {Error} If `key` is not a string.
	 */
	data(key, value) {
		if (typeof key !== 'string') {
			throw new Error('Key must be a string');
		}

		const dataAttr = `data-${key}`;

		if (typeof value === 'undefined') {
			return this.element.getAttribute(dataAttr);
		} else {
			this.element.setAttribute(dataAttr, value);
			return this;
		}
	}

	/**
	 * Checks if an attribute is set to a boolean value.
	 *
	 * @param {string} attrName The attribute name to check.
	 * @returns {boolean} `true` if the attribute exists and is not `false`,
	 *          otherwise `false`.
	 * @throws {Error} If `attrName` is not a string.
	 */
	is(attrName) {
		if (typeof attrName !== 'string') {
			throw new Error('Attribute name must be a string');
		}

		const attrValue = this.element.getAttribute(attrName);
		return attrValue !== null && attrValue !== 'false';
	}

	/**
	 * Removes an attribute from the current element.
	 *
	 * @param {string} attrName The name of the attribute to remove.
	 * @return {RQuery} Returns the RQuery instance.
	 * @throws {Error} If `attrName` is not a string.
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
 * @param {string | HTMLElement} selector A CSS selector string
 *        or an HTMLElement.
 * @returns {Query} A new Query instance wrapping the selected element.
 */
export const $Q = (selector) => new Query(selector);
