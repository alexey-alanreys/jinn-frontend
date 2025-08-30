import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './trades-item.module.css';
import templateHTML from './trades-item.template.html?raw';

export class TradesItem extends BaseComponent {
	static COMPONENT_NAME = 'TradesItem';
	static #PROFIT_FIELDS = [10, 11, 12, 13];

	#$element;
	#dataFields = new Map();

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	update(trade) {
		this.#dataFields.forEach(({ element, isProfitField }, index) => {
			const value = trade[index];
			element.text(value);

			if (isProfitField) {
				this.#applyColorClass(element, value);
			}
		});
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
			const index = Number(el.data('field'));
			const isProfitField = this.#isProfitField(index);
			this.#dataFields.set(index, { element: el, isProfitField });
		});
	}

	#isProfitField(index) {
		return TradesItem.#PROFIT_FIELDS.includes(index);
	}

	#applyColorClass(element, value) {
		if (value.startsWith('-')) {
			element.removeClass(styles.green).addClass(styles.red);
		} else {
			element.removeClass(styles.red).addClass(styles.green);
		}
	}
}
