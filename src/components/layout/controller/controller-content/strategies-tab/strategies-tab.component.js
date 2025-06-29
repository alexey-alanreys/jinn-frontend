import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { notificationService } from '@/core/services/notification.service';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { contextsService } from '@/api/services/contexts.service';

import styles from './strategies-tab.module.css';
import templateHTML from './strategies-tab.template.html?raw';

import { StrategiesItem } from './strategies-item/strategies-item.component';

export class StrategiesTab extends BaseComponent {
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

		this.#items.get(this.#contextId).deactivate();
		this.#items.get(context.id).activate();
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
		this.#contextId = stateService.get('context').id;

		this.#renderInitialItems();
		this.#bindEvents();
	}

	#renderInitialItems() {
		const contexts = stateService.get('contexts');
		const contextId = stateService.get('context').id;
		const $items = this.#$element.find('[data-ref="strategiesItems"]');

		Object.entries(contexts).forEach(([id, context]) => {
			const item = new StrategiesItem();
			this.#items.set(id, item);
			$items.append(item.render());
			item.update(id, context);
		});

		this.#items.get(contextId)?.activate();
	}

	#bindEvents() {
		this.#$element.click(this.#handleClick.bind(this));
		stateService.subscribe('context', this.update.bind(this));
	}

	#handleClick(event) {
		const $target = $Q(event.target);
		const $item = $target.closest('[data-context-id]');
		if (!$item) return;

		const contextId = $item.data('context-id');

		if ($target.closest('button')) {
			this.#handleDelete(contextId);
		} else {
			this.#setContext(contextId);
		}
	}

	async #handleDelete(contextId) {
		try {
			const contexts = stateService.get('contexts');

			if (Object.keys(contexts).length === 1) {
				notificationService.show(
					'warning',
					'Нельзя удалить последнюю стратегию',
				);
				return;
			}

			await contextsService.delete(contextId);

			const currentContextId = stateService.get('context').id;
			const { [contextId]: _, ...remaining } = contexts;
			stateService.set('contexts', remaining);

			if (contextId === currentContextId) {
				const newContextId = Object.keys(remaining)[0];
				this.#setContext(newContextId);
			}

			this.#items.get(contextId).remove();
			this.#items.delete(contextId);

			notificationService.show('success', 'Стратегия успешно удалена');
		} catch (error) {
			console.error('Failed to remove strategy context.', error);
		}
	}

	#setContext(contextId) {
		if (this.#contextId === contextId) return;

		const newContext = stateService.get('contexts')[contextId];
		stateService.set('context', { id: contextId, ...newContext });
	}
}
