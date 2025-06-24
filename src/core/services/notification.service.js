import { $Q } from '@/core/libs/query.lib';

import styles from '@/components/notification/notification.module.css';

/**
 * Service for displaying temporary notifications (success or error).
 */
class NotificationService {
	#queue = [];
	#isShowing = false;

	/**
	 * Processes next notification in queue.
	 *
	 * @private
	 */
	#showNext() {
		if (this.#queue.length === 0 || this.#isShowing) return;

		const notification = $Q('[data-ref="notification"]');
		const { type, message } = this.#queue.shift();
		const className = styles[type];

		const animationDuration =
			parseFloat(notification.css('animation-duration')) * 1000;
		const delayToRemoveClass = animationDuration + 100;
		const delayToShowNext = animationDuration + 500;

		notification
			.addClass(className)
			.find('[data-field="content"]')
			.text(message);
		this.#isShowing = true;

		setTimeout(() => {
			notification.removeClass(className);
			this.#isShowing = false;
		}, delayToRemoveClass);

		setTimeout(() => {
			this.#showNext();
		}, delayToShowNext);
	}

	/**
	 * Adds a notification to the queue and displays it if possible.
	 *
	 * @param {('success'|'error')} type Notification type.
	 * @param {string} message Text to display.
	 * @throws {Error} If the type is invalid.
	 */
	show(type, message) {
		if (!['success', 'error'].includes(type)) {
			throw new Error(
				'Invalid notification type: expected "success" or "error".',
			);
		}

		this.#queue.push({ type, message });

		if (!this.#isShowing) {
			this.#showNext();
		}
	}
}

export const notificationService = new NotificationService();
