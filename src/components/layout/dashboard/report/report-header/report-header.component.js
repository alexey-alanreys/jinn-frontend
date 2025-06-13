import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './report-header.module.css';
import templateHTML from './report-header.template.html?raw';

export class ReportHeader extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
