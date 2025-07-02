import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './toolbox.module.css';
import templateHTML from './toolbox.template.html?raw';

import { ClearDrawingsButton } from './clear-drawings-button/clear-drawings-button.component';
import { FullScreenButton } from './full-screen-button/full-screen-button.component';
import { HideDrawingsButton } from './hide-drawings-button/hide-drawings-button.component';
import { RulerToolButton } from './ruler-tool-button/ruler-tool-button.component';
import { ScreenshotButton } from './screenshot-button/screenshot-button.component';
import { TrendlineToolButton } from './trendline-tool-button/trendline-tool-button.component';

export class Toolbox extends BaseComponent {
	static componentName = 'Toolbox';

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	handleTrendlineToolActivate() {
		this.rulerToolButton.deactivate();
		this.hideDrawingsButton.deactivate();
	}

	handleRulerToolActivate() {
		this.trendlineToolButton.deactivate();
	}

	handleHideDrawingsButtonActivate() {
		this.trendlineToolButton.deactivate();
	}

	#initComponents() {
		this.trendlineToolButton = new TrendlineToolButton({
			onActivate: this.handleTrendlineToolActivate.bind(this),
		});
		this.rulerToolButton = new RulerToolButton({
			onActivate: this.handleRulerToolActivate.bind(this),
		});
		this.hideDrawingsButton = new HideDrawingsButton({
			onActivate: this.handleHideDrawingsButtonActivate.bind(this),
		});
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				ScreenshotButton,
				FullScreenButton,
				this.trendlineToolButton,
				this.rulerToolButton,
				this.hideDrawingsButton,
				ClearDrawingsButton,
			],
			styles,
		);
	}

	#setupInitialState() {
		document.addEventListener('keydown', this.#handleKeydown.bind(this));
	}

	#handleKeydown(event) {
		if (event.key === 'Escape') {
			this.trendlineToolButton.deactivate();
			this.rulerToolButton.deactivate();
		}
	}
}
