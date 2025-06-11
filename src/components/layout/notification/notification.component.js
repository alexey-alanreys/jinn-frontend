import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service.js';

import styles from './notification.module.css';
import template from './notification.template.html';

export class Notification extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(template, [], styles);

		return this.element;
	}
}
