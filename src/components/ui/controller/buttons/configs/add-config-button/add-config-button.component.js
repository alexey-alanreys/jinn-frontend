import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './add-config-button.module.css';
import templateHTML from './add-config-button.template.html?raw';

export class AddConfigButton extends BaseComponent {
	static COMPONENT_NAME = 'AddConfigButton';

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
