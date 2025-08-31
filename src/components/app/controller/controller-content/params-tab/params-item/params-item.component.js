import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { CheckboxInput } from '@/components/ui/controller/inputs/checkbox-input/checkbox-input.component';
import { NumberInput } from '@/components/ui/controller/inputs/number-input/number-input.component';

import styles from './params-item.module.css';
import templateHTML from './params-item.template.html?raw';

export class ParamsItem extends BaseComponent {
	static COMPONENT_NAME = 'ParamsItem';

	#$element;
	#input = null;

	get id() {
		return this.#$element.data('param-id');
	}

	get value() {
		return this.#input?.value ?? null;
	}

	render() {
		this.#initDOM();
		return this.element;
	}

	remove() {
		this.element.remove();
	}

	update({ id, value, title }) {
		this.#$element.data('param-id', id);
		this.#$element.find('[data-ref="paramTitle"]').text(title);

		this.#renderInput(value);
	}

	commit(newValue) {
		if (this.#input) {
			this.#input.commit(newValue);
		}
	}

	rollback() {
		if (this.#input) {
			this.#input.rollback();
		}
	}

	focus() {
		this.#input.focus?.();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		return this.element;
	}

	#renderInput(value) {
		if (this.#input) {
			this.#input.remove();
			this.#input = null;
		}

		if (typeof value === 'number') {
			this.#input = new NumberInput();
		} else if (typeof value === 'boolean') {
			this.#input = new CheckboxInput();
		} else {
			return;
		}

		this.#$element.append(this.#input.render());
		this.#input.update(value);
	}
}
