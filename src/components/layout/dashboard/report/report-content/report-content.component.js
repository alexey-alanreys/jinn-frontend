import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './report-content.module.css';
import templateHTML from './report-content.template.html?raw';

export class ReportContent extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
