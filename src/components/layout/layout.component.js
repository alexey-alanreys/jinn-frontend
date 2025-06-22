import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './layout.module.css';
import templateHTML from './layout.template.html?raw';

import { Dashboard } from './dashboard/dashboard.component';
import { Inspector } from './inspector/inspector.component';
import { Toolbox } from './toolbox/toolbox.component';

export class Layout extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[Toolbox, Dashboard, Inspector],
			styles,
		);
		return this.element;
	}
}
