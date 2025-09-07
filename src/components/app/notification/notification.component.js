import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './notification.module.css';
import template from './notification.template.html?raw';

export class Notification extends BaseComponent {
	static COMPONENT_NAME = 'Notification';

	render() {
		this.element = renderService.htmlToElement(template, [], styles);
		return this.element;
	}
}
