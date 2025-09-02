import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import { executionService } from '@/api/services/execution.service';

import styles from './params-tab.module.css';
import templateHTML from './params-tab.template.html?raw';

import { ParamsItem } from './params-item/params-item.component';

export class ParamsTab extends BaseComponent {
	static COMPONENT_NAME = 'ParamsTab';

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
		this.#attachListeners();
		this.#handleContextUpdate(stateService.get(STATE_KEYS.CONTEXT));
	}

	#attachListeners() {
		this.#$element.on('change', this.#handleChange.bind(this));

		stateService.subscribe(
			STATE_KEYS.CONTEXT,
			this.#handleContextUpdate.bind(this),
		);
	}

	async #handleChange(event) {
		const id = $Q(event.target).data('param-id');
		const item = this.#items.get(id);

		if (item.isValid()) {
			const context = stateService.get(STATE_KEYS.CONTEXT);
			const contextId = context.id;
			const value = item.value;

			try {
				await executionService.update(contextId, id, value);

				stateService.set(STATE_KEYS.CONTEXT, {
					...context,
					params: {
						...context.params,
						[id]: value,
					},
				});
				item.commit();
			} catch (error) {
				console.error('Failed to update strategy parameter.', error);
				item.rollback();
			}
		} else {
			item.rollback();
		}
	}

	#handleContextUpdate(context) {
		const newContextId = context.id ?? null;
		if (this.#contextId === newContextId) return;

		this.#clear();

		if (newContextId) {
			const $items = this.#$element.find('[data-ref="paramsItems"]');
			const strategies = stateService.get(STATE_KEYS.STRATEGIES);
			const strategy = strategies[context.strategy];
			const labels = strategy.paramLabels || {};

			Object.entries(context.params).forEach(([id, value]) => {
				const item = new ParamsItem();
				$items.append(item.render());
				item.update(id, value, labels[id] || id);
				this.#items.set(id, item);
			});
		}

		this.#contextId = newContextId;
	}

	#clear() {
		this.#items.forEach((item) => item.remove());
		this.#items.clear();
	}
}
