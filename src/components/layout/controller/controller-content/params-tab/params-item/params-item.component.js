import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './params-item.module.css';
import templateHTML from './params-item.template.html?raw';

export class ParamsItem extends BaseComponent {
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
		const element = this.#$input.element;
		const type = element.type;

		if (type === 'checkbox') {
			return element.checked;
		}

		const raw = element.value;
		const parsed = parseFloat(raw);
		return isNaN(parsed) ? raw : parsed;
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

	update(id, title, value, group = null) {
		this.#initialState.id = id;
		this.#initialState.title = title;
		this.#initialState.value = value;
		this.#initialState.group = group;

		if (group) {
			this.#$element.attr('data-group', group);
		}

		this.#$element.find('label').attr('for', id).text(title);
		this.#$input = this.#$element.find('input').attr('id', id);

		if (typeof value === 'number') {
			this.#$input.attr('type', 'text');
			this.#$input.element.value = value;
		} else if (typeof value === 'boolean') {
			this.#$input.attr('type', 'checkbox');
			this.#$input.element.checked = !!value;
		}
	}

	commit({ id, title, value, group = null }) {
		this.#initialState = { id, title, value, group };
	}

	rollback() {
		const { id, title, value, group } = this.#initialState;
		this.update(id, title, value, group);
	}
}
