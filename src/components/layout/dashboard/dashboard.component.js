import { BaseComponent } from '@/core/component/base.component.js';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './dashboard.module.css';
import templateHTML from './dashboard.template.html?raw';

import { Chart } from './chart/chart.component';
import { Report } from './report/report.component';

export class Dashboard extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[Chart, Report],
			styles,
		);

		requestAnimationFrame(() => {
			this.#resizeWithHandle();
		});

		return this.element;
	}

	#resizeWithHandle() {
		const reportHandle = $Q(this.element).find('#report-handle');
		const report = $Q(this.element).find('#report');
		const chart = $Q(this.element).find('#chart');

		const reportHandleHeight = parseInt(reportHandle.css('min-height'));
		const reportHeaderHeight = parseInt(
			report.find('#report-header').css('min-height'),
		);
		const reportMinHeight = reportHandleHeight + reportHeaderHeight;

		let startHeight = 0;
		let startY = 0;

		const onMouseMove = (event) => {
			const deltaY = startY - event.clientY;
			const newHeight = Math.max(
				reportMinHeight,
				Math.min(startHeight + deltaY, window.innerHeight),
			);

			report.css('height', `${newHeight}px`);
			chart.css('bottom', `${newHeight}px`);
		};

		reportHandle.on('mousedown', (event) => {
			startHeight = report.element.offsetHeight;
			startY = event.clientY;

			const handleMouseUp = () => {
				$Q(document)
					.off('mousemove', onMouseMove)
					.off('mouseup', handleMouseUp)
					.cursor('default');
			};

			$Q(document)
				.on('mousemove', onMouseMove)
				.on('mouseup', handleMouseUp)
				.cursor('ns-resize');
		});
	}
}
