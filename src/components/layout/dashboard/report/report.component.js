import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './report.module.css';
import templateHTML from './report.template.html?raw';

import { ReportContent } from './report-content/report-content.component';
import { ReportHeader } from './report-header/report-header.component';

export class Report extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[ReportHeader, ReportContent],
			styles,
		);
		return this.element;
	}
}
