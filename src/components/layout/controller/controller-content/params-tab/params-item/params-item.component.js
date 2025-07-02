import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { calculateStep } from '@/utils/number-step.util';

import styles from './params-item.module.css';
import templateHTML from './params-item.template.html?raw';

export class ParamsItem extends BaseComponent {
	static componentName = 'ParamsItem';

	#$element;
	#$input;

	#initialState = {
		id: null,
		title: null,
		value: null,
		group: null,
	};

	get title() {
		return this.#initialState.title;
	}

	get value() {
		const type = this.#$input.element.type;
		const element = this.#$input.element;

		if (type === 'number') {
			return element.valueAsNumber;
		}

		if (type === 'checkbox') {
			return element.checked;
		}

		return element.value;
	}

	get group() {
		return this.#initialState.group;
	}

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		return this.element;
	}

	remove() {
		this.element.remove();
	}

	update({ id, title, value, group = null }) {
		this.#initialState = { id, title, value, group };

		if (group) {
			this.#$element.attr('data-group', group);
		}

		this.#$element.find('label').attr('for', id).text(title);
		this.#$input = this.#$element.find('input').attr('id', id);

		if (typeof value === 'number') {
			this.#$input.attr('type', 'number');
			this.#$input.element.value = value;

			const step = calculateStep(value);
			this.#$input.attr('step', step);
		} else if (typeof value === 'boolean') {
			this.#$input.attr('type', 'checkbox');
			this.#$input.element.checked = !!value;
		}
	}

	commit({ id, title, value, group = null }) {
		this.#initialState = { id, title, value, group };
	}

	rollback() {
		this.update(this.#initialState);
	}
}
