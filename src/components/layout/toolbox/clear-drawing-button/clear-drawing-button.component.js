import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';
import { storageService } from '@/core/services/storage.service';

import styles from './clear-drawing-button.module.css';
import templateHTML from './clear-drawing-button.template.html?raw';

export class ClearDrawingButton extends BaseComponent {
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
		this.#removeSeries();
		this.#clearStorage();
	}

	#removeSeries() {
		const chartApi = stateService.get('chartApi');
		if (!chartApi) return;

		const drawings = stateService.get('drawings') || [];
		drawings.forEach((series) => chartApi.removeSeries(series));

		stateService.set('drawings', []);
	}

	#clearStorage() {
		const storedData = storageService.getItem('drawings');
		if (!storedData) return;

		const contextId = stateService.get('context').id;
		const updated = Object.fromEntries(
			Object.entries(storedData).map(([type, data]) => {
				const { [contextId]: _, ...rest } = data || {};
				return [type, rest];
			}),
		);

		storageService.setItem('drawings', updated);
	}
}
