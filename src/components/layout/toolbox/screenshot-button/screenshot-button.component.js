import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import styles from './screenshot-button.module.css';
import templateHTML from './screenshot-button.template.html?raw';

export class ScreenshotButton extends BaseComponent {
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

		if (chartApi) {
			chartApi.takeScreenshot().toBlob(this.#openScreenshot, 'image/png', 1);
		} else {
			console.warn('[ScreenshotButton] сhartApi not found in stateService');
		}
	}

	#openScreenshot(blob) {
		const url = URL.createObjectURL(blob);
		window.open(url, '_blank');
	}
}
