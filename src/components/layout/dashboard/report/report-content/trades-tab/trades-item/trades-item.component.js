import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './trades-item.module.css';
import templateHTML from './trades-item.template.html?raw';

export class TradesItem extends BaseComponent {
	#$element;

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		return this.element;
	}

	update(trade) {
		this.#$element.findAll('[data-field]').forEach((el) => {
			const index = Number(el.data('field'));
			const value = trade[index] ?? '';
			el.html(value);
		});
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}
}
