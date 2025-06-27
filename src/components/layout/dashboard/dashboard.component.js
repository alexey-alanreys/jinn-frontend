import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './dashboard.module.css';
import templateHTML from './dashboard.template.html?raw';

import { Chart } from './chart/chart.component';
import { ReportHeader } from './report/report-header/report-header.component';
import { ToggleExpansionButton } from './report/report-header/toggle-expansion-button/toggle-expansion-button.component';
import { ToggleVisibilityButton } from './report/report-header/toggle-visibility-button/toggle-visibility-button.component';
import { Report } from './report/report.component';

export class Dashboard extends BaseComponent {
	#$element;
	#reportHeight;
	#reportMaxHeight;
	#reportMinHeight;

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
				this.#reportHeight = this.report.height;
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
				this.#reportHeight = this.report.height;
			}

			this.#resizePanels(this.#reportMaxHeight);
		} else {
			this.#resizePanels(this.#reportHeight);
		}
	}

	handleManualResize(startY) {
		const startHeight = this.report.height;

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
		this.chart = new Chart();

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

		this.report = new Report({
			reportHeader: this.reportHeader,
			onMousedown: this.handleManualResize.bind(this),
		});
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.chart, this.report],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		requestAnimationFrame(() => {
			this.#reportHeight = this.report.height;
			this.#reportMaxHeight = parseInt(this.#$element.css('height'));
			this.#reportMinHeight = this.report.minHeight;
		});
	}

	#resizePanels(height) {
		this.chart.height = height;
		this.report.height = height;
	}
}
