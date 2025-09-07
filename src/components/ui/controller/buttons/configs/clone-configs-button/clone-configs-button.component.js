import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './clone-configs-button.module.css';
import templateHTML from './clone-configs-button.template.html?raw';

export class CloneConfigsButton extends BaseComponent {
	static COMPONENT_NAME = 'CloneConfigsButton';

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
