import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service.js';

import styles from './layout.module.css';
import templateHTML from './layout.template.html';

import { Dashboard } from './dashboard/dashboard.component.js';
import { Inspector } from './inspector/inspector.component.js';
import { Notification } from './notification/notification.component.js';
import { Toolbox } from './toolbox/toolbox.component.js';

export class Layout extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[Notification, Toolbox, Dashboard, Inspector],
			styles,
		);

		return this.element;
	}
}
