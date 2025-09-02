import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './custom-select.module.css';
import templateHTML from './custom-select.template.html?raw';

export class CustomSelect extends BaseComponent {
	static COMPONENT_NAME = 'CustomSelect';

	#$element;
	#$nativeSelect;
	#$value;

	#currentValue = null;
	#options = [];

	constructor({ options = [] } = {}) {
		super();
		this.#options = options;
	}

	get value() {
		return this.#$nativeSelect.element.value;
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();
		this.#renderOptions();
		return this.element;
	}

	update(value) {
		this.#currentValue = value;
		this.#updateDOM();
	}

	commit(newValue) {
		this.#currentValue = newValue;
	}

	rollback() {
		this.#updateDOM();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		this.#$nativeSelect = this.#$element.find('[data-ref="nativeSelect"]');
		this.#$value = this.#$element.find('[data-ref="selectValue"]');
		return this.element;
	}

	#setupInitialState() {
		// Set first option as default
		if (this.#options.length > 0) {
			const firstOption = this.#options[0];
			const firstValue =
				typeof firstOption === 'string' ? firstOption : firstOption.value;
			const firstLabel =
				typeof firstOption === 'string' ? firstOption : firstOption.label;

			this.#currentValue = firstValue;
			this.#$value.text(firstLabel);
		}

		this.#$nativeSelect.on('change', () => {
			this.#handleChange();
		});
	}

	#renderOptions() {
		this.#$nativeSelect.html('');

		// Add real options
		this.#options.forEach((option, index) => {
			const optionElement = document.createElement('option');
			optionElement.value = typeof option === 'string' ? option : option.value;
			optionElement.textContent =
				typeof option === 'string' ? option : option.label;

			// Select first option by default
			if (index === 0) {
				optionElement.selected = true;
			}

			this.#$nativeSelect.element.appendChild(optionElement);
		});
	}

	#updateDOM() {
		if (this.#currentValue !== null) {
			this.#$nativeSelect.element.value = this.#currentValue;

			const selectedOption = this.#options.find(
				(option) =>
					(typeof option === 'string' ? option : option.value) ===
					this.#currentValue,
			);

			if (selectedOption) {
				this.#$value.text(
					typeof selectedOption === 'string'
						? selectedOption
						: selectedOption.label,
				);
			}
		} else if (this.#options.length > 0) {
			// Fallback to first option
			const firstOption = this.#options[0];
			const firstValue =
				typeof firstOption === 'string' ? firstOption : firstOption.value;
			const firstLabel =
				typeof firstOption === 'string' ? firstOption : firstOption.label;

			this.#$nativeSelect.element.value = firstValue;
			this.#$value.text(firstLabel);
		}
	}

	#handleChange() {
		const selectedValue = this.#$nativeSelect.element.value;

		const selectedOption = this.#options.find(
			(option) =>
				(typeof option === 'string' ? option : option.value) === selectedValue,
		);

		if (selectedOption) {
			this.#$value.text(
				typeof selectedOption === 'string'
					? selectedOption
					: selectedOption.label,
			);
		}

		// Trigger change event on the component
		const changeEvent = new CustomEvent('change', {
			bubbles: true,
			detail: { value: selectedValue },
		});
		this.element.dispatchEvent(changeEvent);
	}
}
