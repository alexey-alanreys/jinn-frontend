import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './alerts-tab-button.module.css';
import templateHTML from './alerts-tab-button.template.html?raw';

export class AlertsTabButton extends BaseComponent {
	static COMPONENT_NAME = 'AlertsTabButton';

	#$element;

	get isActive() {
		return this.#$element.is('data-active');
	}

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
