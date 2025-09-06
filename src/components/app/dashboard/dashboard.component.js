import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './dashboard.module.css';
import templateHTML from './dashboard.template.html?raw';

import { ChartPanel } from './chart-panel/chart-panel.component';
import { ReportHeader } from './report-panel/report-header/report-header.component';
import { ToggleExpansionButton } from './report-panel/report-header/toggle-expansion-button/toggle-expansion-button.component';
import { ToggleVisibilityButton } from './report-panel/report-header/toggle-visibility-button/toggle-visibility-button.component';
import { ReportPanel } from './report-panel/report-panel.component';

export class Dashboard extends BaseComponent {
	static COMPONENT_NAME = 'Dashboard';

	#$element = null;

	#reportHeight;
	#reportMinHeight;
	#reportMaxHeight;

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	handleVisibilityToggle() {
		if (this.toggleVisibilityButton.isActive) {
			if (this.toggleExpansionButton.isActive) {
				this.toggleExpansionButton.toggleActiveState();
			} else {
				this.#updateReportMetrics();
			}

			this.#resizePanels(this.#reportMinHeight);
		} else {
			this.#resizePanels(this.#reportHeight);
		}
	}

	handleExpansionToggle() {
		if (this.toggleExpansionButton.isActive) {
			if (this.toggleVisibilityButton.isActive) {
				this.toggleVisibilityButton.toggleActiveState();
			} else {
				this.#updateReportMetrics();
			}

			this.#resizePanels(this.#reportMaxHeight);
		} else {
			this.#resizePanels(this.#reportHeight);
		}
	}

	handleManualResize(startY) {
		this.#updateReportMetrics();

		const startHeight = this.reportPanel.height;

		let isVisActive = this.toggleVisibilityButton.isActive;
		let isExpActive = this.toggleExpansionButton.isActive;

		const onMouseMove = (event) => {
			const newHeight = Math.max(
				this.#reportMinHeight,
				startHeight + startY - event.clientY,
			);

			this.#resizePanels(newHeight);

			if (newHeight === this.#reportMinHeight && !isVisActive) {
				this.toggleVisibilityButton.toggleActiveState();
				isVisActive = !isVisActive;
			} else if (isVisActive && newHeight > this.#reportMinHeight) {
				this.toggleVisibilityButton.toggleActiveState();
				isVisActive = !isVisActive;
			}

			if (newHeight >= this.#reportMaxHeight && !isExpActive) {
				this.toggleExpansionButton.toggleActiveState();
				isExpActive = !isExpActive;
			} else if (isExpActive && newHeight < this.#reportMaxHeight) {
				this.toggleExpansionButton.toggleActiveState();
				isExpActive = !isExpActive;
			}
		};

		const handleMouseUp = () => {
			$Q(document)
				.off('mousemove', onMouseMove)
				.off('mouseup', handleMouseUp)
				.find('body')
				.removeClass('resizing');
		};

		$Q(document)
			.on('mousemove', onMouseMove)
			.on('mouseup', handleMouseUp)
			.find('body')
			.addClass('resizing');
	}

	#initComponents() {
		this.chartPanel = new ChartPanel();

		this.toggleVisibilityButton = new ToggleVisibilityButton({
			onClick: this.handleVisibilityToggle.bind(this),
		});

		this.toggleExpansionButton = new ToggleExpansionButton({
			onClick: this.handleExpansionToggle.bind(this),
		});

		this.reportHeader = new ReportHeader({
			toggleVisibilityButton: this.toggleVisibilityButton,
			toggleExpansionButton: this.toggleExpansionButton,
		});

		this.reportPanel = new ReportPanel({
			reportHeader: this.reportHeader,
			onMousedown: this.handleManualResize.bind(this),
		});
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.chartPanel, this.reportPanel],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		requestAnimationFrame(() => this.#updateReportMetrics());
	}

	#updateReportMetrics() {
		this.#reportHeight = this.reportPanel.height;
		this.#reportMinHeight = this.reportPanel.minHeight;
		this.#reportMaxHeight = parseInt(this.#$element.css('height'));
	}

	#resizePanels(height) {
		this.chartPanel.height = height;
		this.reportPanel.height = height;
	}
}
