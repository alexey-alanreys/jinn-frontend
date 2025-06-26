import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './toolbox.module.css';
import templateHTML from './toolbox.template.html?raw';

import { ClearDrawingButton } from './clear-drawing-button/clear-drawing-button.component';
import { FullScreenButton } from './full-screen-button/full-screen-button.component';
import { HideDrawingButton } from './hide-drawing-button/hide-drawing-button.component';
import { LineToolButton } from './line-tool-button/line-tool-button.component';
import { RulerToolButton } from './ruler-tool-button/ruler-tool-button.component';
import { ScreenshotButton } from './screenshot-button/screenshot-button.component';

export class Toolbox extends BaseComponent {
	#$element;

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	handleLineToolActivate() {
		if (this.rulerToolButton.isActive()) {
			this.rulerToolButton.deactivate();
		}
	}

	handleRulerToolActivate() {
		if (this.lineToolButton.isActive()) {
			this.lineToolButton.deactivate();
		}
	}

	#initComponents() {
		this.lineToolButton = new LineToolButton({
			onActivate: this.handleLineToolActivate.bind(this),
		});
		this.rulerToolButton = new RulerToolButton({
			onActivate: this.handleRulerToolActivate.bind(this),
		});
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				ScreenshotButton,
				FullScreenButton,
				this.lineToolButton,
				this.rulerToolButton,
				HideDrawingButton,
				ClearDrawingButton,
			],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		document.addEventListener('keydown', this.#handleKeydown.bind(this));
	}

	#handleKeydown(event) {
		if (event.key === 'Escape') {
			if (this.lineToolButton.isActive()) {
				this.lineToolButton.deactivate();
			}

			if (this.rulerToolButton.isActive()) {
				this.rulerToolButton.deactivate();
			}
		}
	}
}
