import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './checkbox-input.module.css';
import templateHTML from './checkbox-input.template.html?raw';

export class CheckboxInput extends BaseComponent {
	static COMPONENT_NAME = 'CheckboxInput';

	#$element;
	#$input;

	#value = null;

	get value() {
		return this.#$input.element.checked;
	}

	render() {
		this.#initDOM();
		return this.element;
	}

	update(value) {
		this.#value = value;
		this.#updateDOM();
	}

	commit(newValue) {
		this.#value = newValue;
	}

	rollback() {
		this.#updateDOM();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		this.#$input = this.#$element.find('input');
		return this.element;
	}

	#updateDOM() {
		this.#$input.element.checked = Boolean(this.#value);
	}
}
