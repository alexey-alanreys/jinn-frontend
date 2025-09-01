import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './run-configs-button.module.css';
import templateHTML from './run-configs-button.template.html?raw';

export class RunConfigsButton extends BaseComponent {
	static COMPONENT_NAME = 'RunConfigsButton';

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
