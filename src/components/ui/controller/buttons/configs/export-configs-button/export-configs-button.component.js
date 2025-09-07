import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './export-configs-button.module.css';
import templateHTML from './export-configs-button.template.html?raw';

export class ExportConfigsButton extends BaseComponent {
	static COMPONENT_NAME = 'ExportConfigsButton';

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
