import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { notificationService } from '@/core/services/notification.service';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { SERVER_MODE } from '@/config/mode.config';

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

	#contextId = null;
	#items = new Map();

	get isActive() {
		return this.#$element.css('display') === 'flex';
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();

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
	}

	#setupInitialState() {
		if (SERVER_MODE !== 'AUTOMATION') return;

		this.#contextId = stateService.get('context').id;

		this.#renderInitialItems();
		this.#attachListeners();
	}

	async #renderInitialItems() {
		const alerts = await alertsService.getAll(ALERTS_FETCH_LIMIT);
		const $items = this.#$element.find('[data-ref="alertsItems"]');

		Object.entries(alerts).forEach(([id, alert]) => {
			this.#createAlertItem(id, alert, $items);
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

			notificationService.show('success', 'Оповещение успешно удалено');
		} catch (error) {
			console.error('Failed to remove alert.', error);
		}
	}

	#pollNewAlerts() {
		setInterval(async () => {
			try {
				const newAlerts = await alertsService.getNew();
				const $items = this.#$element.find('[data-ref="alertsItems"]');

				Object.entries(newAlerts).forEach(([id, alert]) => {
					if (this.#items.has(id)) return;

					this.#createAlertItem(id, alert, $items);
				});
			} catch (error) {
				console.error('Failed to fetch new alerts.', error);
			}
		}, ALERTS_POLLING_INTERVAL);
	}

	#createAlertItem(id, alert, $container) {
		const item = new AlertsItem();
		this.#items.set(id, item);
		$container.prepend(item.render());
		item.update(id, alert);
	}
}
