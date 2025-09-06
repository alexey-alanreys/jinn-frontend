import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './docs-button.module.css';
import templateHTML from './docs-button.template.html?raw';

export class DocsButton extends BaseComponent {
	static COMPONENT_NAME = 'DocsButton';

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
