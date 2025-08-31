import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { getChartOptions } from '@/config/chart.config';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import styles from './scroll-button.module.css';
import templateHTML from './scroll-button.template.html?raw';

export class ScrollButton extends BaseComponent {
	static COMPONENT_NAME = 'ScrollButton';

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
		const chartApi = stateService.get(STATE_KEYS.CHART_API);
		if (!chartApi) return;

		const scrollPosition = getChartOptions().timeScale.rightOffset;
		chartApi.timeScale().scrollToPosition(scrollPosition, false);
	}
}
