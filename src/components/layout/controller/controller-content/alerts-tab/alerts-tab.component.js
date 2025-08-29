import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { notificationService } from '@/core/services/notification.service';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import {
	ALERTS_FETCH_LIMIT,
	ALERTS_POLLING_INTERVAL,
} from '@/constants/alerts.constants';

import { alertsService } from '@/api/services/alerts.service';

import styles from './alerts-tab.module.css';
import templateHTML from './alerts-tab.template.html?raw';

import { AlertsItem } from './alerts-item/alerts-item.component';

export class AlertsTab extends BaseComponent {
	static COMPONENT_NAME = 'AlertsTab';

	#$element;
	#$alertsItems;

	#contextId = null;
	#items = new Map();

	get isActive() {
		return this.#$element.css('display') === 'flex';
	}

	render() {
		this.#initDOM();

		// TODO
		// this.#setupInitialState();

		return this.element;
	}

	update(context) {
		if (this.#contextId === context.id) return;

		this.#contextId = context.id;
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);

		this.#$element = $Q(this.element);
		this.#$alertsItems = this.#$element.find('[data-ref="alertsItems"]');
	}

	#setupInitialState() {
		this.#contextId = stateService.get('context').id;

		this.#renderInitialItems();
		this.#attachListeners();
	}

	async #renderInitialItems() {
		const alerts = await alertsService.get({ limit: ALERTS_FETCH_LIMIT });

		Object.entries(alerts).forEach(([id, alert]) => {
			this.#createAlertItem(id, alert);
		});
	}

	#attachListeners() {
		this.#$element.click(this.#handleClick.bind(this));
		stateService.subscribe('context', this.update.bind(this));
		this.#pollNewAlerts();
	}

	#handleClick(event) {
		const $target = $Q(event.target);
		const $item = $target.closest('[data-alert-id]');
		if (!$item) return;

		if ($target.closest('[data-ref="openStrategy"]')) {
			this.#setContext($item.data('context-id'));
			return;
		}

		if ($target.closest('[data-ref="removeAlert"]')) {
			this.#handleDelete($item.data('alert-id'));
			return;
		}

		const isActive = $item.is('data-active');
		$item.data('active', String(!isActive));
	}

	#setContext(contextId) {
		if (this.#contextId === contextId) return;

		const newContext = stateService.get('contexts')[contextId];
		stateService.set('context', { id: contextId, ...newContext });
	}

	async #handleDelete(alertId) {
		try {
			await alertsService.delete(alertId);

			this.#items.get(alertId).remove();
			this.#items.delete(alertId);

			notificationService.show('success', 'Alert deleted successfully');
		} catch (error) {
			console.error('Failed to remove alert.', error);
		}
	}

	#pollNewAlerts() {
		setInterval(async () => {
			try {
				console.log(Array.from(this.#items.keys()).at(-1));

				const newAlerts = await alertsService.get({
					sinceId: Array.from(this.#items.keys()).at(-1),
				});

				Object.entries(newAlerts).forEach(([id, alert]) => {
					if (this.#items.has(id)) return;

					this.#createAlertItem(id, alert);
				});
			} catch (error) {
				console.error('Failed to fetch new alerts.', error);
			}
		}, ALERTS_POLLING_INTERVAL);
	}

	#createAlertItem(id, alert) {
		const item = new AlertsItem();

		this.#$alertsItems.prepend(item.render());
		this.#items.set(id, item);
		item.update(id, alert);
	}
}
