import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './trades-item.module.css';
import templateHTML from './trades-item.template.html?raw';

export class TradesItem extends BaseComponent {
	static #PROFIT_FIELDS = [10, 11, 12, 13];

	#$element;
	#dataFields = new Map();
	#redClass = styles['red'];

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);

		this.#$element.findAll('[data-field]').forEach((el) => {
			const index = Number(el.data('field'));
			const isProfit = this.#isProfitField(index);
			this.#dataFields.set(index, { element: el, isProfit });
		});

		return this.element;
	}

	update(trade) {
		this.#dataFields.forEach(({ element, isProfit }, index) => {
			const value = trade[index] ?? '';
			element.html(value);

			if (isProfit && value.startsWith('-')) {
				element.addClass(this.#redClass);
			} else if (isProfit) {
				element.removeClass(this.#redClass);
			}
		});
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	#isProfitField(index) {
		return TradesItem.#PROFIT_FIELDS.includes(index);
	}
}
