/**
 * Simple key-value store with subscription support.
 */
class StateService {
	constructor() {
		this.state = {};
		this.subscribers = new Map();
	}

	/**
	 * Sets a value by key and notifies subscribers.
	 *
	 * @param {string} key The key to set.
	 * @param {*} value The value to store.
	 */
	set(key, value) {
		this.state[key] = value;
		this.#notify(key, value);
	}

	/**
	 * Gets a value by key.
	 *
	 * @param {string} key The key to retrieve.
	 * @returns {*} The stored value or undefined.
	 */
	get(key) {
		return this.state[key];
	}

	/**
	 * Subscribes to changes for a key.
	 *
	 * @param {string} key Key to observe.
	 * @param {function} callback Function to call on change.
	 */
	subscribe(key, callback) {
		if (!this.subscribers.has(key)) {
			this.subscribers.set(key, new Set());
		}

		this.subscribers.get(key).add(callback);
	}

	/**
	 * Unsubscribes from key changes.
	 *
	 * @param {string} key Observed key.
	 * @param {function} callback Function to remove.
	 */
	unsubscribe(key, callback) {
		if (this.subscribers.has(key)) {
			const callbacks = this.subscribers.get(key);
			callbacks.delete(callback);

			if (callbacks.size === 0) {
				this.subscribers.delete(key);
			}
		}
	}

	/**
	 * Notifies all subscribers of a key's change.
	 *
	 * @private
	 * @param {string} key
	 * @param {*} value
	 */
	#notify(key, value) {
		this.subscribers.get(key)?.forEach((callback) => callback(value));
	}
}

export const stateService = new StateService();
