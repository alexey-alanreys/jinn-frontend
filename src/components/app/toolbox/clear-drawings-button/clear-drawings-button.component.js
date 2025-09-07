import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { drawingsService } from '@/core/services/drawings.service';
import { notificationService } from '@/core/services/notification.service';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import styles from './clear-drawings-button.module.css';
import templateHTML from './clear-drawings-button.template.html?raw';

export class ClearDrawingsButton extends BaseComponent {
	static COMPONENT_NAME = 'ClearDrawingsButton';

	#$element = null;

	render() {
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.on('click', this.#handleClick.bind(this));
	}

	#handleClick() {
		const chartApi = stateService.get(STATE_KEYS.CHART_API);
		const candlestickSeries = stateService.get(STATE_KEYS.CANDLE_SERIES);

		if (!chartApi || !candlestickSeries) {
			notificationService.show('warning', 'No chart data available');
			return;
		}

		drawingsService.removeAll();
		drawingsService.clear();
	}
}
