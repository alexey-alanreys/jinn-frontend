import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { calculateStep } from '@/utils/number-step.util';

import styles from './params-item.module.css';
import templateHTML from './params-item.template.html?raw';

export class ParamsItem extends BaseComponent {
	static componentName = 'ParamsItem';

	#$element;
	#$label;
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
		this.#initDOM();
		this.#setupInitialState();

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

		this.#$label.attr('for', id).text(title);
		this.#$input.attr('id', id);

		if (typeof value === 'number') {
			this.#$input.attr('type', 'number').attr('step', calculateStep(value));
			this.#$input.element.value = value;
			this.#$element.find('[data-ref="numberStepper"]').css('display', 'flex');
		} else if (typeof value === 'boolean') {
			this.#$input.attr('type', 'checkbox');
			this.#$input.element.checked = !!value;
			this.#$element.find('[data-ref="numberStepper"]').css('display', 'none');
		}
	}

	commit({ id, title, value, group = null }) {
		this.#initialState = { id, title, value, group };
	}

	rollback() {
		this.update(this.#initialState);
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

	#handleStepperUp(event) {
		event.preventDefault();
		event.stopPropagation();

		if (this.#$input.element.type !== 'number') return;

		const currentValue = this.#$input.element.valueAsNumber || 0;
		const step = parseFloat(this.#$input.attr('step')) || 1;
		const newValue = currentValue + step;

		this.#$input.element.value = newValue;
		this.#triggerChange();
	}

	#handleStepperDown(event) {
		event.preventDefault();
		event.stopPropagation();

		if (this.#$input.element.type !== 'number') return;

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
