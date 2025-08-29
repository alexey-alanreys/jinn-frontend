import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { ExecutionService } from '@/api/services/execution.service';

import styles from './params-tab.module.css';
import templateHTML from './params-tab.template.html?raw';

import { ParamsItem } from './params-item/params-item.component';

export class ParamsTab extends BaseComponent {
	static COMPONENT_NAME = 'ParamsTab';

	#$element;

	#contextId = null;
	#itemsById = new Map();
	#itemsByGroup = new Map();

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
		this.#clear();

		const params = context.strategyParams;
		const $items = this.#$element.find('[data-ref="paramsItems"]');

		Object.entries(params).forEach(([title, value]) => {
			if (Array.isArray(value)) {
				value.forEach((entry, index) => {
					const item = new ParamsItem();
					const label = `${title} ${index + 1}`;
					const id = `param-${title}-${index}`;

					$items.append(item.render());
					item.update({ id, title: label, value: entry, group: title });
					this.#registerItem(item, id, title);
				});
			} else {
				const item = new ParamsItem();
				const id = `param-${title}`;

				$items.append(item.render());
				item.update({ id, title, value });
				this.#registerItem(item, id);
			}
		});
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
		this.update(stateService.get('context'));
	}

	#attachListeners() {
		this.#$element.on('change', this.#handleInput.bind(this));
		stateService.subscribe('context', this.update.bind(this));
	}

	#registerItem(item, id, group = null) {
		this.#itemsById.set(id, item);
		if (!group) return;

		const groupItems = this.#itemsByGroup.get(group) ?? [];
		groupItems.push(item);
		this.#itemsByGroup.set(group, groupItems);
	}

	async #handleInput(event) {
		const context = stateService.get('context');
		const contextId = context.id;

		const id = $Q(event.target).attr('id');
		const item = this.#itemsById.get(id);
		const title = item.title;
		const group = item.group;
		const value = item.value;

		try {
			let param = null;
			let valueToRequest = null;

			if (group) {
				param = group;
				valueToRequest = Array.from(
					this.#itemsByGroup.get(group).values(),
				).map((item) => item.value);
			} else {
				param = title;
				valueToRequest = value;
			}

			await ExecutionService.update(contextId, param, valueToRequest);
			item.commit({ id, title, value, group });

			stateService.set('context', {
				...context,
				strategyParams: {
					...context.strategyParams,
					[param]: value,
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
		this.#itemsByGroup.clear();
	}
}
