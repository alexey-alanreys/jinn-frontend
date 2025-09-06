import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './import-configs-button.module.css';
import templateHTML from './import-configs-button.template.html?raw';

export class ImportConfigsButton extends BaseComponent {
	static COMPONENT_NAME = 'ImportConfigsButton';

	#$element = null;
	#$input = null;

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		this.#$input = this.#$element.find('[data-ref="fileInput"]');
		return this.element;
	}

	clickOnInput() {
		this.#$input.element.click();
	}

	resetInput() {
		this.#$input.element.value = '';
	}
}
