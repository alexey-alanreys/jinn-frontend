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
	#items = new Map();

	get isActive() {
		return this.#$element.css('display') === 'flex';
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
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
		this.#renderInitialItems();
		this.#bindEvents();
	}

	#renderInitialItems() {
		const contexts = stateService.get('contexts');
		const contextId = stateService.get('context').id;
		const container = this.#$element.find('[data-ref="strategiesItems"]');

		Object.entries(contexts).forEach(([id, context]) => {
			const item = new StrategiesItem();
			this.#items.set(id, item);
			container.append(item.render());
			item.update(id, context);
		});

		this.#items.get(contextId)?.activate();
	}

	#bindEvents() {
		this.#$element.click(this.#handleClick.bind(this));
	}

	#handleClick(event) {
		const $target = $Q(event.target);
		const $item = $target.closest('[data-context-id]');
		if (!$item) return;

		const id = $item.data('context-id');

		if ($target.closest('button')) {
			this.#handleDelete(id);
		} else {
			this.#selectContext(id);
		}
	}

	async #handleDelete(id) {
		try {
			const contexts = stateService.get('contexts');

			if (Object.keys(contexts).length === 1) {
				notificationService.show(
					'warning',
					'Нельзя удалить последнюю стратегию',
				);
				return;
			}

			await contextsService.delete(id);

			const currentId = stateService.get('context').id;
			const { [id]: _, ...remaining } = contexts;
			stateService.set('contexts', remaining);

			if (id === currentId) {
				const fallbackId = Object.keys(remaining)[0];
				this.#selectContext(fallbackId);
			}

			this.#items.get(id).remove();
			this.#items.delete(id);
		} catch (error) {
			console.error('Failed to remove strategy context.', error);
		}
	}

	#selectContext(id) {
		const currentId = stateService.get('context').id;
		if (id === currentId) return;

		const newContext = stateService.get('contexts')[id];
		stateService.set('context', { id, ...newContext });

		this.#items.get(currentId)?.deactivate();
		this.#items.get(id)?.activate();
	}
}
