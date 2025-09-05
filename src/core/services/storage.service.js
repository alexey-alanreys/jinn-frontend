/**
 * @module storageService
 * @description
 * Service that provides an interface for working with localStorage
 * in a more convenient and structured way.
 */
class StorageService {
	/**
	 * Retrieves an item from localStorage by the provided key.
	 *
	 * @param {string} key The key of the item to be retrieved.
	 * @returns {any} The parsed value of the item,
	 * or null if the item doesn't exist or parsing fails.
	 */
	getItem(key) {
		if (!this.#isLocalStorageAvailable()) {
			console.warn('localStorage is not available.');
			return null;
		}

		const value = localStorage.getItem(key);
		if (value === null) return null;

		try {
			return JSON.parse(value);
		} catch (error) {
			console.error(`Failed to parse localStorage item: "${key}"`, error);
			return null;
		}
	}

	/**
	 * Saves an item in localStorage with the provided key and value.
	 *
	 * @param {string} key The key under which the value will be stored.
	 * @param {any} value The value to be stored.
	 */
	setItem(key, value) {
		if (!this.#isLocalStorageAvailable()) {
			console.warn('localStorage is not available.');
			return;
		}

		localStorage.setItem(key, JSON.stringify(value));
	}

	/**
	 * Removes an item from localStorage by the provided key.
	 *
	 * @param {string} key The key of the item to be removed.
	 */
	removeItem(key) {
		if (!this.#isLocalStorageAvailable()) {
			console.warn('localStorage is not available.');
			return;
		}

		localStorage.removeItem(key);
	}

	/**
	 * Clears all data from localStorage.
	 */
	clear() {
		if (!this.#isLocalStorageAvailable()) {
			console.warn('localStorage is not available.');
			return;
		}

		localStorage.clear();
	}

	/**
	 * Checks if localStorage is available.
	 *
	 * @returns {boolean} True if localStorage is available, false otherwise.
	 */
	#isLocalStorageAvailable() {
		try {
			const testKey = '__test__';
			localStorage.setItem(testKey, testKey);
			localStorage.removeItem(testKey);
			return true;
		} catch {
			return false;
		}
	}
}

export const storageService = new StorageService();
