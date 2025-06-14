import { BaseComponent } from '@/core/component/base.component.js';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './dashboard.module.css';
import templateHTML from './dashboard.template.html?raw';

import { Chart } from './chart/chart.component';
import { Report } from './report/report.component';

export class Dashboard extends BaseComponent {
	#chart;
	#report;
	#reportHandle;
	#reportHeader;
	#expansionBtn;
	#visibilityBtn;

	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[Chart, Report],
			styles,
		);

		requestAnimationFrame(() => {
			this.#cacheElements();

			this.#handleExpansionToggle();
			this.#handleVisibilityToggle();

			this.#handleManualResize();
		});

		return this.element;
	}

	#handleExpansionToggle() {
		let lastKnownHeight = parseInt(this.#report.css('height'));

		this.#expansionBtn.on('click', () => {
			const isExpanded = this.#expansionBtn.attr('data-expanded') === 'true';

			if (!isExpanded) {
				if (this.#visibilityBtn.attr('data-visible') !== 'false') {
					lastKnownHeight = parseInt(this.#report.css('height'));
				}

				this.#report.css('height', `${window.innerHeight}px`);
				this.#chart.css('bottom', `${window.innerHeight}px`);

				this.#visibilityBtn
					.attr('data-visible', 'true')
					.attr('title', 'Свернуть панель');
			} else {
				this.#report.css('height', `${lastKnownHeight}px`);
				this.#chart.css('bottom', `${lastKnownHeight}px`);
			}

			this.#expansionBtn
				.attr('data-expanded', String(!isExpanded))
				.attr('title', `${isExpanded ? 'Развернуть' : 'Восстановить'} панель`);
		});
	}

	#handleVisibilityToggle() {
		const reportMinHeight = this.#getReportMinHeight();
		let lastKnownHeight = parseInt(this.#report.css('height'));

		this.#visibilityBtn.on('click', () => {
			const isVisible = this.#visibilityBtn.attr('data-visible') === 'true';

			if (isVisible) {
				if (this.#expansionBtn.attr('data-expanded') !== 'true') {
					lastKnownHeight = parseInt(this.#report.css('height'));
				}

				this.#report.css('height', `${reportMinHeight}px`);
				this.#chart.css('bottom', `${reportMinHeight}px`);

				this.#expansionBtn
					.attr('data-expanded', 'false')
					.attr('title', 'Развернуть панель');
			} else {
				this.#report.css('height', `${lastKnownHeight}px`);
				this.#chart.css('bottom', `${lastKnownHeight}px`);
			}

			this.#visibilityBtn
				.attr('data-visible', String(!isVisible))
				.attr('title', `${isVisible ? 'Открыть' : 'Свернуть'} панель`);
		});
	}

	#handleManualResize() {
		const reportMinHeight = this.#getReportMinHeight();
		const reportMaxHeight = window.innerHeight;

		let isExpanded = this.#expansionBtn.attr('data-expanded') === 'true';
		let isVisible = this.#visibilityBtn.attr('data-visible') === 'true';

		let startHeight = 0;
		let startY = 0;

		const onMouseMove = (event) => {
			const newHeight = Math.max(
				reportMinHeight,
				startHeight + startY - event.clientY,
			);

			this.#report.css('height', `${newHeight}px`);
			this.#chart.css('bottom', `${newHeight}px`);

			if (newHeight >= reportMaxHeight && !isExpanded) {
				isExpanded = !isExpanded;

				this.#expansionBtn
					.attr('data-expanded', 'true')
					.attr('title', 'Восстановить панель');
			} else if (isExpanded && newHeight < reportMaxHeight) {
				isExpanded = !isExpanded;

				this.#expansionBtn
					.attr('data-expanded', 'false')
					.attr('title', 'Развернуть панель');
			}

			if (newHeight === reportMinHeight && isVisible) {
				isVisible = !isVisible;

				this.#visibilityBtn
					.attr('data-visible', 'false')
					.attr('title', 'Развернуть панель');
			} else if (!isVisible && newHeight > reportMinHeight) {
				isVisible = !isVisible;

				this.#visibilityBtn
					.attr('data-visible', 'true')
					.attr('title', 'Свернуть панель');
			}
		};

		this.#reportHandle.on('mousedown', (event) => {
			isVisible = this.#visibilityBtn.attr('data-status') === 'visible';
			isExpanded = this.#expansionBtn.attr('data-status') === 'collapsed';

			startHeight = this.#report.element.offsetHeight;
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

	#cacheElements() {
		this.#chart = $Q(this.element).find('#chart');
		this.#report = $Q(this.element).find('#report');
		this.#reportHandle = $Q(this.element).find('#report-handle');
		this.#reportHeader = $Q(this.element).find('#report-header');
		this.#expansionBtn = $Q(this.element).find('#toggle-expansion-button');
		this.#visibilityBtn = $Q(this.element).find('#toggle-visibility-button');
	}

	#getReportMinHeight() {
		return (
			parseInt(this.#reportHandle.css('min-height')) +
			parseInt(this.#reportHeader.css('min-height'))
		);
	}
}
