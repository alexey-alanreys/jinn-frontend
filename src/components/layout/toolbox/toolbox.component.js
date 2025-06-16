import { BaseComponent } from '@/core/component/base.component';
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
	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				ScreenshotButton,
				FullScreenButton,
				LineToolButton,
				RulerToolButton,
				HideDrawingButton,
				ClearDrawingButton,
			],
			styles,
		);
		return this.element;
	}
}
