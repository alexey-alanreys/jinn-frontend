import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './overview-metrics-tab-button.module.css';
import templateHTML from './overview-metrics-tab-button.template.html?raw';

export class OverviewMetricsTabButton extends BaseComponent {
	static COMPONENT_NAME = 'OverviewMetricsTabButton';

	#$element;

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		return this.element;
	}

	setOnClick(callback) {
		this.#$element.click(callback);
	}

	activate() {
		this.#$element.data('active', 'true');
	}

	deactivate() {
		this.#$element.data('active', 'false');
	}
}
