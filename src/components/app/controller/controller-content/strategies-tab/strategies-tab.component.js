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

	#$element = null;
	#items = new Map();

	#contextId;

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
		const context = stateService.get(STATE_KEYS.EXECUTION_CONTEXT);
		this.#contextId = context.id;

		this.#renderInitialItems();
		this.#attachListeners();
	}

	#renderInitialItems() {
		const contexts = stateService.get(STATE_KEYS.EXECUTION_CONTEXTS);
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
			STATE_KEYS.EXECUTION_CONTEXT,
			this.#handleContextUpdate.bind(this),
		);
		stateService.subscribe(
			STATE_KEYS.EXECUTION_CONTEXTS,
			this.#handleContextsUpdate.bind(this),
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

	#handleContextUpdate(context) {
		if (this.#contextId === context.id) return;

		if (this.#contextId && this.#items.has(this.#contextId)) {
			this.#items.get(this.#contextId).deactivate();
		}

		if (context.id && this.#items.has(context.id)) {
			this.#items.get(context.id).activate();
		}

		this.#contextId = context.id;
	}

	#handleContextsUpdate(contexts) {
		const $items = this.#$element.find('[data-ref="strategiesItems"]');

		this.#items.forEach((item, id) => {
			if (!contexts[id]) {
				item.remove();
				this.#items.delete(id);
			}
		});

		Object.entries(contexts).forEach(([id, context]) => {
			if (!this.#items.has(id)) {
				const item = new StrategiesItem();
				this.#items.set(id, item);
				$items.append(item.render());
				item.update(id, context);
			}
		});

		if (!this.#contextId && Object.keys(contexts).length) {
			const firstContextId = Object.keys(contexts)[0];
			this.#setContext(firstContextId);
		}
	}

	async #handleDelete(contextId) {
		try {
			await executionService.delete(contextId);

			const contexts = stateService.get(STATE_KEYS.EXECUTION_CONTEXTS);
			const { [contextId]: _, ...remaining } = contexts;
			stateService.set(STATE_KEYS.EXECUTION_CONTEXTS, remaining);

			if (contextId === this.#contextId) {
				const keys = Object.keys(remaining);

				if (keys.length) {
					this.#setContext(keys[0]);
				} else {
					this.#setEmptyContext();
				}
			}

			if (contextId === this.#contextId) {
				drawingsService.removeAll();
				drawingsService.clear();
			}

			notificationService.show('success', 'Strategy deleted successfully');
		} catch (error) {
			notificationService.show('error', 'Failed to delete strategy');
			console.error(`Failed to delete context ${contextId}.`, error);
		}
	}

	#setContext(contextId) {
		if (this.#contextId === contextId) return;

		const newContext = stateService.get(STATE_KEYS.EXECUTION_CONTEXTS)[
			contextId
		];
		stateService.set(STATE_KEYS.EXECUTION_CONTEXT, {
			id: contextId,
			...newContext,
		});
	}

	#setEmptyContext() {
		stateService.set(STATE_KEYS.EXECUTION_CONTEXT, {});
		this.#contextId = undefined;
	}
}
