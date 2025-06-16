import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './overview-tab-button.module.css';
import templateHTML from './overview-tab-button.template.html?raw';

export class OverviewTabButton extends BaseComponent {
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
