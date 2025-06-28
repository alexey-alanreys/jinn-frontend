import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { reportService } from '@/api/services/report.service';

import styles from './trades-tab.module.css';
import templateHTML from './trades-tab.template.html?raw';

import { ToggleSortingButton } from './toggle-sorting-button/toggle-sorting-button.component';
import { TradesItem } from './trades-item/trades-item.component';

export class TradesTab extends BaseComponent {
	#$element;

	#cachedTrades = [];
	#itemsMap = new Map();

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	async update(context) {
		try {
			const trades = await reportService.getTrades(context.id);
			this.#cachedTrades = [...trades];

			this.#ensureCorrectSortOrder();
			this.#renderTrades();
		} catch (error) {
			console.error('Failed to update trades.', error);
		}
	}

	handleSortingToggle() {
		if (this.#cachedTrades.length > 0) {
			this.#applySorting();
			this.#renderTrades();
		}
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	#initComponents() {
		this.toggleSortingButton = new ToggleSortingButton({
			onClick: this.handleSortingToggle.bind(this),
		});
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.toggleSortingButton],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		stateService.subscribe('context', this.update.bind(this));
		this.update(stateService.get('context'));
	}

	#ensureCorrectSortOrder() {
		if (this.#cachedTrades.length < 2) return;

		const shouldReverse = this.toggleSortingButton.isActive
			? this.#cachedTrades[0][0] < this.#cachedTrades[1][0]
			: this.#cachedTrades[0][0] > this.#cachedTrades[1][0];

		if (shouldReverse) {
			this.#applySorting();
		}
	}

	#renderTrades() {
		const tradesItems = this.#$element.find('[data-ref="tradesItems"]');
		this.#removeOrphanedItems();

		this.#cachedTrades.forEach((trade, index) => {
			let item = this.#itemsMap.get(index);

			if (!item) {
				item = new TradesItem();
				this.#itemsMap.set(index, item);
				tradesItems.append(item.render());
			}

			item.update(trade);
		});
	}

	#applySorting() {
		this.#cachedTrades.reverse();
	}

	#removeOrphanedItems() {
		const validKeys = new Set(this.#cachedTrades.map((_, i) => i));

		this.#itemsMap.forEach((item, key) => {
			if (!validKeys.has(key)) {
				item.remove();
				this.#itemsMap.delete(key);
			}
		});
	}
}
