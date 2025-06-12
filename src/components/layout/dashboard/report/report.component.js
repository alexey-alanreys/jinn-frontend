import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './report.module.css';
import templateHTML from './report.template.html';

export class Report extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
