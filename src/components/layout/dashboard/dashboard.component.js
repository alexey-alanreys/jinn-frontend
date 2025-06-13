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
	#sizeBtn;
	#visibilityBtn;

	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[Chart, Report],
			styles,
		);

		requestAnimationFrame(() => {
			this.#cacheElements();

			this.#handleVisibilityToggle();
			this.#handleSizeToggle();
			this.#handleManualResize();
		});

		return this.element;
	}

	#handleSizeToggle() {
		let lastKnownHeight = parseInt(this.#report.css('height'));

		this.#sizeBtn.on('click', () => {
			const isCollapsed = this.#sizeBtn.attr('data-status') === 'collapsed';

			if (isCollapsed) {
				if (this.#visibilityBtn.attr('data-status') !== 'hidden') {
					lastKnownHeight = parseInt(this.#report.css('height'));
				}

				this.#report.css('height', `${window.innerHeight}px`);
				this.#chart.css('bottom', `${window.innerHeight}px`);

				this.#visibilityBtn
					.attr('data-status', 'visible')
					.attr('title', 'Свернуть панель');
			} else {
				this.#report.css('height', `${lastKnownHeight}px`);
				this.#chart.css('bottom', `${lastKnownHeight}px`);
			}

			this.#sizeBtn
				.attr('data-status', isCollapsed ? 'expanded' : 'collapsed')
				.attr(
					'title',
					isCollapsed ? 'Восстановить панель' : 'Развернуть панель',
				);
		});
	}

	#handleVisibilityToggle() {
		const reportMinHeight = this.#getReportMinHeight();
		let lastKnownHeight = parseInt(this.#report.css('height'));

		this.#visibilityBtn.on('click', () => {
			const isVisible = this.#visibilityBtn.attr('data-status') === 'visible';

			if (isVisible) {
				if (this.#sizeBtn.attr('data-status') !== 'expanded') {
					lastKnownHeight = parseInt(this.#report.css('height'));
				}

				this.#report.css('height', `${reportMinHeight}px`);
				this.#chart.css('bottom', `${reportMinHeight}px`);

				this.#sizeBtn
					.attr('data-status', 'collapsed')
					.attr('title', 'Развернуть панель');
			} else {
				this.#report.css('height', `${lastKnownHeight}px`);
				this.#chart.css('bottom', `${lastKnownHeight}px`);
			}

			this.#visibilityBtn
				.attr('data-status', isVisible ? 'hidden' : 'visible')
				.attr('title', isVisible ? 'Открыть панель' : 'Свернуть панель');
		});
	}

	#handleManualResize() {
		const reportMinHeight = this.#getReportMinHeight();
		const reportMaxHeight = window.innerHeight;

		let isVisible = this.#visibilityBtn.attr('data-status') === 'visible';
		let isCollapsed = this.#sizeBtn.attr('data-status') === 'collapsed';

		let startHeight = 0;
		let startY = 0;

		const onMouseMove = (event) => {
			const newHeight = Math.max(
				reportMinHeight,
				startHeight + startY - event.clientY,
			);

			this.#report.css('height', `${newHeight}px`);
			this.#chart.css('bottom', `${newHeight}px`);

			if (newHeight === reportMinHeight && isVisible) {
				isVisible = !isVisible;

				this.#visibilityBtn
					.attr('data-status', 'hidden')
					.attr('title', 'Развернуть панель');
			} else if (!isVisible && newHeight > reportMinHeight) {
				isVisible = !isVisible;

				this.#visibilityBtn
					.attr('data-status', 'visible')
					.attr('title', 'Свернуть панель');
			}

			if (newHeight >= reportMaxHeight && isCollapsed) {
				isCollapsed = !isCollapsed;

				this.#sizeBtn
					.attr('data-status', 'expanded')
					.attr('title', 'Восстановить панель');
			} else if (!isCollapsed && newHeight < reportMaxHeight) {
				isCollapsed = !isCollapsed;

				this.#sizeBtn
					.attr('data-status', 'collapsed')
					.attr('title', 'Развернуть панель');
			}
		};

		this.#reportHandle.on('mousedown', (event) => {
			isVisible = this.#visibilityBtn.attr('data-status') === 'visible';
			isCollapsed = this.#sizeBtn.attr('data-status') === 'collapsed';

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
		this.#sizeBtn = $Q(this.element).find('#report-size-button');
		this.#visibilityBtn = $Q(this.element).find('#report-visibility-button');
	}

	#getReportMinHeight() {
		return (
			parseInt(this.#reportHandle.css('min-height')) +
			parseInt(this.#reportHeader.css('min-height'))
		);
	}
}
