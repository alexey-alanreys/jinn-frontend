import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { drawingsService } from '@/core/services/drawings.service';
import { notificationService } from '@/core/services/notification.service';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import { executionService } from '@/api/services/execution.service';

import styles from './strategies-tab.module.css';
import templateHTML from './strategies-tab.template.html?raw';

import { StrategiesItem } from './strategies-item/strategies-item.component';

export class StrategiesTab extends BaseComponent {
	static COMPONENT_NAME = 'StrategiesTab';

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

	show() {
		this.#$element.css('display', 'flex');
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		const context = stateService.get(STATE_KEYS.CONTEXT);
		this.#contextId = context.id ?? null;

		this.#renderInitialItems();
		this.#attachListeners();
	}

	#renderInitialItems() {
		const contexts = stateService.get(STATE_KEYS.CONTEXTS);
		const $items = this.#$element.find('[data-ref="strategiesItems"]');

		if (!Object.keys(contexts).length) {
			return;
		}

		Object.entries(contexts).forEach(([id, context]) => {
			const item = new StrategiesItem();
			this.#items.set(id, item);
			$items.append(item.render());
			item.update(id, context);
		});

		if (this.#contextId && this.#items.has(this.#contextId)) {
			this.#items.get(this.#contextId).activate();
		}
	}

	#attachListeners() {
		this.#$element.click(this.#handleClick.bind(this));
		stateService.subscribe(
			STATE_KEYS.CONTEXT,
			this.#handleContextUpdate.bind(this),
		);
	}

	#handleClick(event) {
		const $target = $Q(event.target);
		const $item = $target.closest('[data-context-id]');
		if (!$item) return;

		const contextId = $item.data('context-id');

		if ($target.closest('[data-ref="deleteButton"]')) {
			this.#handleDelete(contextId);
		} else {
			this.#setContext(contextId);
		}
	}

	async #handleDelete(contextId) {
		try {
			await executionService.delete(contextId);

			drawingsService.removeAll();
			drawingsService.clear();

			const contexts = stateService.get(STATE_KEYS.CONTEXTS);
			const { [contextId]: _, ...remaining } = contexts;
			stateService.set(STATE_KEYS.CONTEXTS, remaining);

			if (contextId === this.#contextId) {
				const remainingKeys = Object.keys(remaining);

				if (remainingKeys.length > 0) {
					const newContextId = remainingKeys[0];
					this.#setContext(newContextId);
				} else {
					this.#setEmptyContext();
				}
			}

			if (this.#items.has(contextId)) {
				this.#items.get(contextId).remove();
				this.#items.delete(contextId);
			}

			notificationService.show('success', 'Strategy deleted successfully');
		} catch (error) {
			console.error('Failed to remove strategy context.', error);
			notificationService.show('error', 'Failed to delete strategy');
		}
	}

	#setContext(contextId) {
		if (this.#contextId === contextId) return;

		const newContext = stateService.get(STATE_KEYS.CONTEXTS)[contextId];
		stateService.set(STATE_KEYS.CONTEXT, { id: contextId, ...newContext });
	}

	#setEmptyContext() {
		stateService.set(STATE_KEYS.CONTEXT, {});
		this.#contextId = null;
	}

	#handleContextUpdate(context) {
		const newContextId = context.id ?? null;
		if (this.#contextId === newContextId) return;

		if (this.#contextId && this.#items.has(this.#contextId)) {
			this.#items.get(this.#contextId).deactivate();
		}

		if (newContextId && this.#items.has(newContextId)) {
			this.#items.get(newContextId).activate();
		}

		this.#contextId = newContextId;
	}
}
