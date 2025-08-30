import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import { ExecutionService } from '@/api/services/execution.service';

import styles from './params-tab.module.css';
import templateHTML from './params-tab.template.html?raw';

import { ParamsItem } from './params-item/params-item.component';

export class ParamsTab extends BaseComponent {
	static COMPONENT_NAME = 'ParamsTab';

	#$element;

	#contextId = null;
	#itemsById = new Map();

	get isActive() {
		return this.#$element.css('display') === 'flex';
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	update(context) {
		const newContextId = context.id ?? null;
		if (this.#contextId === newContextId) return;

		this.#clear();

		if (newContextId) {
			const $items = this.#$element.find('[data-ref="paramsItems"]');

			Object.entries(context.params).forEach(([title, value]) => {
				const item = new ParamsItem();
				const id = `param-${title}`;

				$items.append(item.render());
				item.update({ id, title, value });
				this.#itemsById.set(id, item);
			});
		}

		this.#contextId = newContextId;
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
		this.#attachListeners();
		this.update(stateService.get(STATE_KEYS.CONTEXT));
	}

	#attachListeners() {
		this.#$element.on('change', this.#handleInput.bind(this));
		stateService.subscribe(STATE_KEYS.CONTEXT, this.update.bind(this));
	}

	async #handleInput(event) {
		const context = stateService.get(STATE_KEYS.CONTEXT);
		const contextId = context.id;

		const id = $Q(event.target).attr('id');
		const item = this.#itemsById.get(id);
		const title = item.title;
		const value = item.value;

		try {
			await ExecutionService.update(contextId, title, value);
			item.commit({ id, title, value });

			stateService.set(STATE_KEYS.CONTEXT, {
				...context,
				params: {
					...context.params,
					[title]: value,
				},
			});
		} catch (error) {
			console.error('Failed to update strategy parameter.', error);
			item.rollback();
		}
	}

	#clear() {
		this.#itemsById.forEach((item) => item.remove());
		this.#itemsById.clear();
	}
}
