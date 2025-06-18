import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './trades-tab.module.css';
import templateHTML from './trades-tab.template.html?raw';

import { ToggleSortingButton } from './toggle-sorting-button/toggle-sorting-button.component';
import { TradesItem } from './trades-item/trades-item.component';

export class TradesTab extends BaseComponent {
	#$element;
	#itemsMap = new Map();

	render() {
		this.toggleSortingButton = new ToggleSortingButton({
			onClick: this.handleSortingToggle.bind(this),
		});

		this.element = renderService.htmlToElement(
			templateHTML,
			[this.toggleSortingButton],
			styles,
		);
		this.#$element = $Q(this.element);
		return this.element;
	}

	update(trades) {
		const list = this.#$element.find('[data-ref="trades-items"]');

		trades.forEach((trade, key) => {
			let item = this.#itemsMap.get(key);

			if (!item) {
				item = new TradesItem();
				this.#itemsMap.set(key, item);
				list.append(item.render());
			}

			item.update(trade);
		});
	}

	handleSortingToggle() {
		console.log('Toggle!');
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}
}
