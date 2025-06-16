import { BaseComponent } from '@/core/component/base.component.js';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './report.module.css';
import templateHTML from './report.template.html?raw';

import { ReportContent } from './report-content/report-content.component';

export class Report extends BaseComponent {
	#$element;

	render() {
		this.reportHeader = this.props.reportHeader;

		this.element = renderService.htmlToElement(
			templateHTML,
			[this.reportHeader, ReportContent],
			styles,
		);

		this.#$element = $Q(this.element);
		this.#$element
			.find('#report-handle')
			.on('mousedown', this.#handleMousedown.bind(this));

		return this.element;
	}

	getHeight() {
		return parseInt(this.#$element.css('height'));
	}

	getMinHeight() {
		const reportHandle = this.#$element.find('#report-handle');

		return (
			parseInt(reportHandle.css('min-height')) +
			this.reportHeader.getMinHeight()
		);
	}

	getOffsetHeight() {
		return this.#$element.element.offsetHeight;
	}

	setHeight(height) {
		this.#$element.css('height', `${height}px`);
	}

	#handleMousedown(event) {
		this.props.onMousedown?.(event.clientY);
	}
}
