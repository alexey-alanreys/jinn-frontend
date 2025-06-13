import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './dashboard.module.css';
import templateHTML from './dashboard.template.html?raw';

import { Chart } from './chart/chart.component';
import { Report } from './report/report.component';

export class Dashboard extends BaseComponent {
	render() {
		this.chart = new Chart();
		this.report = new Report();

		this.element = renderService.htmlToElement(
			templateHTML,
			[this.chart, this.report],
			styles,
		);
		return this.element;
	}
}
