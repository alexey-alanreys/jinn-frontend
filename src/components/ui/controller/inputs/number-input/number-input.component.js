import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { calculateStep } from '@/utils/number-step.util';

import styles from './number-input.module.css';
import templateHTML from './number-input.template.html?raw';

export class NumberInput extends BaseComponent {
	static COMPONENT_NAME = 'NumberInput';

	#$element = null;
	#$input = null;

	#value;

	get value() {
		return this.#$input.element.valueAsNumber;
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

	isValid() {
		return /^-?\d+(\.\d+)?$/.test(this.value);
	}

	commit() {
		this.#value = this.value;
	}

	rollback() {
		this.#updateDOM();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		this.#$input = this.#$element.find('input');
	}

	#setupInitialState() {
		this.#$element
			.find('[data-ref="stepperUp"]')
			.click(this.#handleStepperUp.bind(this));
		this.#$element
			.find('[data-ref="stepperDown"]')
			.click(this.#handleStepperDown.bind(this));
	}

	#updateDOM() {
		this.#$input.attr('step', calculateStep(this.#value));
		this.#$input.element.value = this.#value;
	}

	#handleStepperUp(event) {
		event.preventDefault();
		event.stopPropagation();

		const currentValue = this.#$input.element.valueAsNumber || 0;
		const step = parseFloat(this.#$input.attr('step')) || 1;
		const newValue = currentValue + step;

		this.#$input.element.value = newValue;
		this.#triggerChange();
	}

	#handleStepperDown(event) {
		event.preventDefault();
		event.stopPropagation();

		const currentValue = this.#$input.element.valueAsNumber || 0;
		const step = parseFloat(this.#$input.attr('step')) || 1;
		const newValue = currentValue - step;

		this.#$input.element.value = newValue;
		this.#triggerChange();
	}

	#triggerChange() {
		const changeEvent = new Event('change', { bubbles: true });
		this.#$input.element.dispatchEvent(changeEvent);
	}
}
