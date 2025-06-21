import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './report.module.css';
import templateHTML from './report.template.html?raw';

import { ReportContent } from './report-content/report-content.component';

export class Report extends BaseComponent {
	#$element;

	constructor({ reportHeader, onMousedown }) {
		super();

		this.reportHeader = reportHeader;
		this.onMousedown = onMousedown;
	}

	render() {
		this.reportContent = new ReportContent();

		this.element = renderService.htmlToElement(
			templateHTML,
			[this.reportHeader, this.reportContent],
			styles,
		);

		this.#$element = $Q(this.element);
		this.#$element
			.find('[data-ref="handle"]')
			.on('mousedown', this.#handleMousedown.bind(this));

		this.reportHeader.connectButtons((tabName) => {
			this.reportContent.showOnly(tabName);
		});

		return this.element;
	}

	get height() {
		return parseInt(this.#$element.css('height'));
	}

	set height(height) {
		this.#$element.css('height', `${height}px`);
	}

	get minHeight() {
		const reportHandle = this.#$element.find('[data-ref="handle"]');

		return (
			parseInt(reportHandle.css('min-height')) + this.reportHeader.minHeight
		);
	}

	#handleMousedown(event) {
		this.onMousedown?.(event.clientY);
	}
}
