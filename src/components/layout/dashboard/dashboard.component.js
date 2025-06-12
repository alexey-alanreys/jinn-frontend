import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './dashboard.module.css';
import templateHTML from './dashboard.template.html';

import { Chart } from './chart/chart.component';
import { Report } from './report/report.component';

export class Dashboard extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[Chart, Report],
			styles,
		);
		return this.element;
	}
}
