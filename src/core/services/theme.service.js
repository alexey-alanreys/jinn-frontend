import { stateService } from '@/core/services/state.service';
import { storageService } from '@/core/services/storage.service';

/**
 * @module themeService
 * @description
 * Service for managing application theme state,
 * including initialization, switching between themes,
 * and synchronization with storage and DOM.
 */
class ThemeService {
	#attribute = 'data-theme';
	#storageKey = 'theme';
	#lightTheme = 'light';
	#darkTheme = 'dark';
	#autoTheme = 'auto';

	/**
	 * Light theme identifier.
	 *
	 * @type {string}
	 */
	get LIGHT() {
		return this.#lightTheme;
	}

	/**
	 * Dark theme identifier.
	 *
	 * @type {string}
	 */
	get DARK() {
		return this.#darkTheme;
	}

	/**
	 * Automatic theme identifier, which adapts to system settings.
	 *
	 * @type {string}
	 */
	get AUTO() {
		return this.#autoTheme;
	}

	/**
	 * Initializes the application theme by loading the saved preference
	 * from storage and applying it to the DOM and state service.
	 * Falls back to the default theme if no saved preference exists.
	 *
	 * @returns {string} The initialized theme value.
	 */
	init() {
		const saved = storageService.getItem(this.#storageKey) || this.#lightTheme;
		this.#applyTheme(saved);
		return saved;
	}

	/**
	 * Toggles between light and dark themes.
	 * If current theme is not light, switches to light.
	 *
	 * @returns {string} The new theme after toggling.
	 */
	toggle() {
		const current = this.get();
		const newTheme = current === this.LIGHT ? this.DARK : this.LIGHT;
		this.#applyTheme(newTheme);
		return newTheme;
	}

	/**
	 * Gets the currently active theme from the state service.
	 *
	 * @returns {string} The current theme value.
	 */
	get() {
		return stateService.get('theme') || this.#lightTheme;
	}

	/**
	 * Sets the light theme, updating storage, DOM, and state service.
	 */
	setLightTheme() {
		this.#applyTheme(this.#lightTheme);
	}

	/**
	 * Sets the dark theme, updating storage, DOM, and state service.
	 */
	setDarkTheme() {
		this.#applyTheme(this.#darkTheme);
	}

	/**
	 * Sets the auto theme, updating storage, DOM, and state service.
	 */
	setAutoTheme() {
		this.#applyTheme(this.#autoTheme);
	}

	/**
	 * Applies theme to DOM, storage, and state service.
	 *
	 * @private
	 * @param {string} theme The theme to apply.
	 */
	#applyTheme(theme) {
		document.documentElement.setAttribute(this.#attribute, theme);
		storageService.setItem(this.#storageKey, theme);
		stateService.set('theme', theme);
	}
}

export const themeService = new ThemeService();
