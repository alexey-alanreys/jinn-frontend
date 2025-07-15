import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { calculateStep } from '@/utils/number-step.util';

import styles from './params-item.module.css';
import templateHTML from './params-item.template.html?raw';

export class ParamsItem extends BaseComponent {
	static COMPONENT_NAME = 'ParamsItem';
	static INPUT_TYPES = {
		NUMBER: 'number',
		CHECKBOX: 'checkbox',
	};

	#$element;
	#$label;
	#$input;

	#state = {
		id: null,
		title: null,
		value: null,
		group: null,
	};

	get title() {
		return this.#state.title;
	}

	get value() {
		const type = this.#$input.element.type;
		const element = this.#$input.element;

		switch (type) {
			case ParamsItem.INPUT_TYPES.NUMBER:
				return element.valueAsNumber;
			case ParamsItem.INPUT_TYPES.CHECKBOX:
				return element.checked;
			default:
				return element.value;
		}
	}

	get group() {
		return this.#state.group;
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	remove() {
		this.element.remove();
	}

	update({ id, title, value, group = null }) {
		this.#setState({ id, title, value, group });
		this.#updateDOM();
	}

	commit({ id, title, value, group = null }) {
		this.#state = { id, title, value, group };
	}

	rollback() {
		this.#updateDOM();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);

		this.#$element = $Q(this.element);
		this.#$label = this.#$element.find('label');
		this.#$input = this.#$element.find('input');

		return this.element;
	}

	#setupInitialState() {
		this.#$element
			.find('[data-ref="stepperUp"]')
			.click(this.#handleStepperUp.bind(this));
		this.#$element
			.find('[data-ref="stepperDown"]')
			.click(this.#handleStepperDown.bind(this));
	}

	#setState(newState) {
		this.#state = { ...newState };
	}

	#updateDOM() {
		const { id, title, value, group } = this.#state;

		if (group) {
			this.#$element.attr('data-group', group);
		}

		this.#$label.attr('for', id).text(title);
		this.#$input.attr('id', id);

		this.#configureInputByType(value);
	}

	#configureInputByType(value) {
		const stepperElement = this.#$element.find('[data-ref="numberStepper"]');

		if (typeof value === 'number') {
			this.#configureNumberInput(value);
			stepperElement.css('display', 'flex');
		} else if (typeof value === 'boolean') {
			this.#configureBooleanInput(value);
			stepperElement.css('display', 'none');
		}
	}

	#configureNumberInput(value) {
		this.#$input
			.attr('type', ParamsItem.INPUT_TYPES.NUMBER)
			.attr('step', calculateStep(value));
		this.#$input.element.value = value;
	}

	#configureBooleanInput(value) {
		this.#$input.attr('type', ParamsItem.INPUT_TYPES.CHECKBOX);
		this.#$input.element.checked = Boolean(value);
	}

	#handleStepperUp(event) {
		event.preventDefault();
		event.stopPropagation();

		if (this.#$input.element.type !== ParamsItem.INPUT_TYPES.NUMBER) return;

		const currentValue = this.#$input.element.valueAsNumber || 0;
		const step = parseFloat(this.#$input.attr('step')) || 1;
		const newValue = currentValue + step;

		this.#$input.element.value = newValue;
		this.#triggerChange();
	}

	#handleStepperDown(event) {
		event.preventDefault();
		event.stopPropagation();

		if (this.#$input.element.type !== ParamsItem.INPUT_TYPES.NUMBER) return;

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
