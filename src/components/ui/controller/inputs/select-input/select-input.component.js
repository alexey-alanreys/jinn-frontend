import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './select-input.module.css';
import templateHTML from './select-input.template.html?raw';

export class SelectInput extends BaseComponent {
	static COMPONENT_NAME = 'SelectInput';

	#$element;
	#$options;
	#$value;

	#optionsData = [];
	#value = null;

	constructor({ options = [] } = {}) {
		super();
		this.#optionsData = options;
	}

	get value() {
		return this.#value;
	}

	get isActive() {
		return this.#$options.data('active');
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

	commit() {
		this.#value = this.value;
	}

	rollback() {
		this.#updateDOM();
	}

	open() {
		this.#$element.data('active', 'true');
	}

	close() {
		this.#$element.data('active', 'false');
	}

	toggle() {
		const isActive = this.#$element.is('data-active');
		this.#$element.data('active', String(!isActive));
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		this.#renderInitialItems();
	}

	#renderInitialItems() {
		this.#$options = this.#$element.find('[data-ref="options"]');
		this.#$value = this.#$element.find('[data-ref="value"]');

		const html = this.#optionsData
			.map((item) => {
				return `<li data-value="${item}" data-ref="option">${item}</li>`;
			})
			.join('');
		this.#$options.html(html);
	}

	#setupInitialState() {
		if (this.#optionsData.length > 0) {
			this.#value = this.#optionsData[0];
			this.#$value.data('value', this.#value).text(this.#value);
		}
	}

	#updateDOM() {
		const selected = this.#optionsData.find((item) => item === this.#value);

		if (selected) {
			this.#$value.data('value', selected).text(selected);
		}
	}
}
