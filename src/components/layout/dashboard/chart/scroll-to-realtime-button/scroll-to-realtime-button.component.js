import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { getChartOptions } from '@/config/chart.config';

import styles from './scroll-to-realtime-button.module.css';
import templateHTML from './scroll-to-realtime-button.template.html?raw';

export class ScrollToRealtimeButton extends BaseComponent {
	static componentName = 'ScrollToRealtimeButton';

	#$element;

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
		const chartApi = stateService.get('chartApi');
		if (!chartApi) return;

		const scrollPosition = getChartOptions().timeScale.rightOffset;
		chartApi.timeScale().scrollToPosition(scrollPosition, false);
	}
}
