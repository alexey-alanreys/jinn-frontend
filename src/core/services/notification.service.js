import { $Q } from '@/core/libs/query.lib';

import styles from '@/components/layout/notification/notification.module.css';

/**
 * Service for displaying temporary notifications (success or error).
 */
export class NotificationService {
	#timeout = null;

	/**
	 * Clears existing timeout and sets a new one.
	 * @param {Function} callback
	 * - Function to execute after timeout.
	 * @param {number} duration
	 * - Duration in milliseconds.
	 * @private
	 */
	#setTimeout(callback, duration) {
		if (this.#timeout) {
			clearTimeout(this.#timeout);
		}

		this.#timeout = setTimeout(callback, duration);
	}

	/**
	 * Displays a notification with the specified type and message.
	 * Automatically hides the notification after a delay.
	 *
	 * @param {('success'|'error')} type
	 * - Notification type.
	 * @param {string} message
	 * - Text to display.
	 * @throws {Error} If the type is not 'success' or 'error'.
	 */
	show(type, message) {
		if (!['success', 'error'].includes(type)) {
			throw new Error(
				'Invalid notification type: expected "success" or "error".',
			);
		}

		const notification = $Q('#notification');
		const className = styles[type];

		notification.text(message).addClass(className);

		this.#setTimeout(() => {
			notification.removeClass(className);
		}, 3000);
	}
}
