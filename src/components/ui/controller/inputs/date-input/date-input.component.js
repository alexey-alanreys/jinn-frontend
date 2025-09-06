import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './date-input.module.css';
import templateHTML from './date-input.template.html?raw';

export class DateInput extends BaseComponent {
	static COMPONENT_NAME = 'DateInput';

	#$element = null;
	#$input = null;

	#value;

	get value() {
		return this.#$input.element.value;
	}

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		this.#$input = this.#$element.find('input');
		return this.element;
	}

	update(value) {
		this.#value = value;
		this.#updateDOM();
	}

	isValid() {
		const currentValue = this.value;
		const regex = /^\d{4}-\d{2}-\d{2}$/;

		if (!regex.test(currentValue)) return false;

		const date = new Date(currentValue);
		if (Number.isNaN(date.getTime())) return false;

		return date.toISOString().slice(0, 10) === currentValue;
	}

	commit() {
		this.#value = this.value;
	}

	rollback() {
		this.#updateDOM();
	}

	#updateDOM() {
		this.#$input.element.value = this.#value;
	}
}
