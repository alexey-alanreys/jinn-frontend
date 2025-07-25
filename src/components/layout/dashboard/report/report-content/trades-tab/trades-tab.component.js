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
	static COMPONENT_NAME = 'TradesTab';

	#$element;

	#cachedTrades = [];
	#renderedItems = new Map();
	#visibleStartIndex = 0;
	#visibleEndIndex = 0;
	#itemHeight = 100;
	#minVisibleItems = 10;
	#scrollTop = 0;
	#lastScrollTime = 0;
	#scrollThrottleDelay = 30;

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

			this.#clearRenderedItems();
			this.#ensureCorrectSortOrder();
			this.#calculateVisibleRange();
			this.#renderTrades();
		} catch (error) {
			console.error('Failed to update trades.', error);
		}
	}

	handleSortingToggle() {
		if (this.#cachedTrades.length > 0) {
			this.#clearRenderedItems();
			this.#applySorting();
			this.#calculateVisibleRange();
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
		this.#attachListeners();
		this.update(stateService.get('context'));
	}

	#attachListeners() {
		this.#$element.on('scroll', this.#handleScroll.bind(this));
		stateService.subscribe('context', this.update.bind(this));
	}

	#handleScroll() {
		const now = Date.now();
		if (now - this.#lastScrollTime < this.#scrollThrottleDelay) return;

		this.#lastScrollTime = now;
		this.#scrollTop = this.#$element.element.scrollTop;

		this.#calculateVisibleRange();
		this.#renderTrades();
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

	#calculateVisibleRange() {
		const minItemsToShow = Math.max(
			this.#minVisibleItems,
			Math.ceil(this.#$element.element.clientHeight / this.#itemHeight) + 2,
		);

		this.#visibleStartIndex = Math.floor(this.#scrollTop / this.#itemHeight);
		this.#visibleEndIndex = Math.min(
			this.#visibleStartIndex + minItemsToShow - 1,
			this.#cachedTrades.length - 1,
		);
	}

	#renderTrades() {
		const $items = this.#$element.find('[data-ref="tradesItems"]');
		const totalHeight = this.#cachedTrades.length * this.#itemHeight;
		$items.css('height', `${totalHeight}px`);

		const newRenderedItems = new Map();

		for (let i = this.#visibleStartIndex; i <= this.#visibleEndIndex; i++) {
			const trade = this.#cachedTrades[i];
			let item;

			if (this.#renderedItems.has(i)) {
				item = this.#renderedItems.get(i);
			} else {
				item = new TradesItem();
				$items.append(item.render());

				const $item = $Q(item.element);
				$item.css({
					position: 'absolute',
					top: `${i * this.#itemHeight}px`,
					left: '0',
					right: '0',
					height: `${this.#itemHeight}px`,
				});

				item.update(trade);
			}

			newRenderedItems.set(i, item);
		}

		for (const [i, item] of this.#renderedItems) {
			if (!newRenderedItems.has(i)) {
				item.element.remove();
			}
		}

		this.#renderedItems = newRenderedItems;
	}

	#clearRenderedItems() {
		for (const item of this.#renderedItems.values()) {
			item.element.remove();
		}
		this.#renderedItems.clear();
	}

	#applySorting() {
		this.#cachedTrades.reverse();
	}
}
