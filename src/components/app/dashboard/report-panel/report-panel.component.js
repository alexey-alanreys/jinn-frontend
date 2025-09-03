import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './report-panel.module.css';
import templateHTML from './report-panel.template.html?raw';

import { ReportContent } from './report-content/report-content.component';

export class ReportPanel extends BaseComponent {
	static COMPONENT_NAME = 'ReportPanel';

	#$element;

	constructor({ reportHeader, onMousedown }) {
		super();

		this.reportHeader = reportHeader;
		this.onMousedown = onMousedown;
	}

	get height() {
		return parseInt(this.#$element.css('height'));
	}

	set height(height) {
		this.#$element.css('height', `${height}px`);
	}

	get minHeight() {
		const handleMinHeight = this.#$element
			.find('[data-ref="handle"]')
			.css('min-height');
		const headerMinHeight = this.reportHeader.minHeight;

		return parseInt(handleMinHeight) + headerMinHeight;
	}

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	#initComponents() {
		this.reportContent = new ReportContent();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.reportHeader, this.reportContent],
			styles,
		);

		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element
			.find('[data-ref="handle"]')
			.on('mousedown', this.#handleMousedown.bind(this));

		this.reportHeader.connectButtons((tabName) => {
			this.reportContent.showOnly(tabName);
		});
	}

	#handleMousedown(event) {
		this.onMousedown?.(event.clientY);
	}
}
