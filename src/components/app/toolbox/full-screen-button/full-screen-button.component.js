import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './full-screen-button.module.css';
import templateHTML from './full-screen-button.template.html?raw';

export class FullScreenButton extends BaseComponent {
	static COMPONENT_NAME = 'FullScreenButton';

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
		const chart = $Q('[data-ref="chartPanel"]').element;
		if (!chart) return;

		const requestFullScreen =
			chart.requestFullscreen?.bind(chart) ||
			chart.webkitRequestFullscreen?.bind(chart) ||
			chart.mozRequestFullScreen?.bind(chart) ||
			chart.msRequestFullscreen?.bind(chart);

		if (requestFullScreen) {
			requestFullScreen();
		}
	}
}
