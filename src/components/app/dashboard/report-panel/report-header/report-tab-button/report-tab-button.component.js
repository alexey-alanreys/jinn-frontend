import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './report-tab-button.module.css';
import templateHTML from './report-tab-button.template.html?raw';

export class ReportTabButton extends BaseComponent {
	static COMPONENT_NAME = 'ReportTabButton';

	#$element;
	#title;

	constructor({ title }) {
		super();
		this.#title = title;
	}

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element).text(this.#title);
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
