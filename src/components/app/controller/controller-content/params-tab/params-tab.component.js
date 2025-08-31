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
		this.#$element.on('change', this.#handleInput.bind(this));
		this.#$element.click(this.#handleClick.bind(this));

		stateService.subscribe(
			STATE_KEYS.CONTEXT,
			this.#handleContextUpdate.bind(this),
		);
	}

	async #handleInput(event) {
		const context = stateService.get(STATE_KEYS.CONTEXT);
		const contextId = context.id;

		const $root = $Q(event.target).closest('[data-param-id]');
		const id = $root.data('param-id');
		const item = this.#items.get(id);
		const value = item.value;

		try {
			await executionService.update(contextId, id, value);

			item.commit(value);

			stateService.set(STATE_KEYS.CONTEXT, {
				...context,
				params: {
					...context.params,
					[id]: value,
				},
			});
		} catch (error) {
			console.error('Failed to update strategy parameter.', error);
			item.rollback();
		}
	}

	#handleClick(event) {
		const $target = $Q(event.target);
		if ($target.data('ref') !== 'paramTitle') return;

		const root = $target.closest('[data-param-id]');
		this.#items.get(root.data('param-id')).focus();
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
				item.update({ id, value, title: labels[id] || id });
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
