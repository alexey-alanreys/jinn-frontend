import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './text-input.module.css';
import templateHTML from './text-input.template.html?raw';

export class TextInput extends BaseComponent {
	static COMPONENT_NAME = 'TextInput';

	#$element = null;
	#$input = null;
	#value = null;

	#placeholder;

	constructor({ placeholder = '' } = {}) {
		super();
		this.#placeholder = placeholder;
	}

	get value() {
		return this.#$input.element.value;
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();
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

	#setupInitialState() {
		if (this.#placeholder) {
			this.#$input.attr('placeholder', this.#placeholder);
		}
	}

	#updateDOM() {
		this.#$input.element.value = this.#value || '';
	}
}
