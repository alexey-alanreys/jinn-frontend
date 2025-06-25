import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './full-screen-button.module.css';
import templateHTML from './full-screen-button.template.html?raw';

export class FullScreenButton extends BaseComponent {
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
		const chart = $Q('[data-ref="chart"]').element;

		if (chart.requestFullscreen) {
			chart.requestFullscreen();
		} else if (chart.webkitrequestFullscreen) {
			chart.webkitRequestFullscreen();
		} else if (chart.mozRequestFullscreen) {
			chart.mozRequestFullScreen();
		}
	}
}
