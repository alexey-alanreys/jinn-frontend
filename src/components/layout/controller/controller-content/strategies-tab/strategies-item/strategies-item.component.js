import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './strategies-item.module.css';
import templateHTML from './strategies-item.template.html?raw';

export class StrategiesItem extends BaseComponent {
	#$element;
	#dataFields = new Map();

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	update(id, context) {
		this.#dataFields.forEach(({ element }, key) => {
			this.#$element.data('cid', id);
			element.text(context[key]);
		});
	}

	activate() {
		this.#$element.data('active', 'true');
	}

	deactivate() {
		this.#$element.data('active', 'false');
	}

	remove() {
		this.element.remove();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.findAll('[data-field]').forEach((el) => {
			const key = el.data('field');
			this.#dataFields.set(key, { element: el });
		});
	}
}
