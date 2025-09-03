import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';

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
		this.#setupInitialState();
		return this.element;
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);

		this.#$element = $Q(this.element);
		this.#$alertsItems = this.#$element.find('[data-ref="alertsItems"]');
	}

	#setupInitialState() {
		const context = stateService.get(STATE_KEYS.CONTEXT);
		this.#contextId = context.id ?? null;

		this.#renderInitialAlerts();
		this.#attachListeners();
	}

	#renderInitialAlerts() {
		const alerts = stateService.get(STATE_KEYS.ALERTS) || [];

		alerts.forEach((alert) => {
			this.#createAlertItem(alert.alertId, alert);
		});
	}

	#attachListeners() {
		this.#$element.click(this.#handleClick.bind(this));
		stateService.subscribe(
			STATE_KEYS.CONTEXT,
			this.#handleContextUpdate.bind(this),
		);
		stateService.subscribe(
			STATE_KEYS.ALERTS,
			this.#handleAlertsUpdate.bind(this),
		);
	}

	#handleClick(event) {
		const $target = $Q(event.target);
		const $item = $target.closest('[data-alert-id]');
		if (!$item) return;

		if ($target.closest('[data-ref="openButton"]')) {
			this.#setContext($item.data('context-id'));
			return;
		}

		if ($target.closest('[data-ref="deleteButton"]')) {
			this.#handleAlertDelete($item.data('alert-id'));
			return;
		}

		const isActive = $item.is('data-active');
		$item.data('active', String(!isActive));
	}

	#setContext(contextId) {
		if (this.#contextId === contextId) return;

		const contexts = stateService.get(STATE_KEYS.CONTEXTS);
		if (!contexts[contextId]) return;

		const newContext = contexts[contextId];
		stateService.set(STATE_KEYS.CONTEXT, { id: contextId, ...newContext });
	}

	#handleContextUpdate(context) {
		const newContextId = context.id ?? null;
		if (this.#contextId === newContextId) return;

		this.#contextId = newContextId;
	}

	#handleAlertsUpdate(alerts) {
		if (!alerts.length) return;

		alerts.forEach((alert) => {
			if (!this.#items.has(alert.alertId)) {
				this.#createAlertItem(alert.alertId, alert);
			}
		});
	}

	#createAlertItem(id, alert) {
		const item = new AlertsItem();

		this.#$alertsItems.prepend(item.render());
		this.#items.set(id, item);
		item.update(alert);
	}

	async #handleAlertDelete(alertId) {
		try {
			await alertsService.delete(alertId);

			const currentAlerts = stateService.get(STATE_KEYS.ALERTS) || [];
			const filteredAlerts = currentAlerts.filter(
				(alert) => alert.alertId !== alertId,
			);
			stateService.set(STATE_KEYS.ALERTS, filteredAlerts);

			const item = this.#items.get(alertId);
			if (item) {
				item.remove();
				this.#items.delete(alertId);
			}
		} catch (error) {
			console.error('Failed to delete alert.', error);
		}
	}
}
