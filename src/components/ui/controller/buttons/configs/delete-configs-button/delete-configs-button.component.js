import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './delete-configs-button.module.css';
import templateHTML from './delete-configs-button.template.html?raw';

export class DeleteConfigsButton extends BaseComponent {
	static COMPONENT_NAME = 'DeleteConfigsButton';

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
