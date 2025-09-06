import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { CheckboxInput } from '@/components/ui/controller/inputs/checkbox-input/checkbox-input.component';
import { NumberInput } from '@/components/ui/controller/inputs/number-input/number-input.component';

import styles from './params-item.module.css';
import templateHTML from './params-item.template.html?raw';

export class ParamsItem extends BaseComponent {
	static COMPONENT_NAME = 'ParamsItem';

	#$element = null;
	#input = null;

	get value() {
		return this.#input?.value ?? null;
	}

	render() {
		this.#initDOM();
		return this.element;
	}

	update(id, value, title) {
		this.#$element.find('[data-field="title"]').text(title);
		this.#renderInput(id, value);
	}

	remove() {
		this.element.remove();
	}

	isValid() {
		return this.#input?.isValid();
	}

	commit() {
		this.#input?.commit();
	}

	rollback() {
		this.#input?.rollback();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		return this.element;
	}

	#renderInput(id, value) {
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

		const element = this.#input.render();
		this.#$element.append(element);

		$Q(element).find('input').data('param-id', id);
		this.#input.update(value);
	}
}
