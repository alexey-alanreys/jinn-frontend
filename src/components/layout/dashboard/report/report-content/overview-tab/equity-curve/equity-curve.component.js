import { AreaSeries, createChart } from 'lightweight-charts';

import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import { chartOptions, seriesOptions } from '@/config/equity.config';

import {
	MARKER_RANGE_THRESHOLD,
	TOOLTIP_MIN_LEFT,
} from '@/constants/equity-curve.constants';

import styles from './equity-curve.module.css';
import templateHTML from './equity-curve.template.html?raw';

import { EquityTooltip } from './equity-tooltip/equity-tooltip.component';

export class EquityCurve extends BaseComponent {
	#chart;
	#timeScale;
	#equitySeries;
	#containerLeftOffset;
	#containerBottomOffset;
	#markersVisible = false;

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	update(equity) {
		this.#equitySeries.setData(equity);
		this.#timeScale.fitContent();
	}

	#initComponents() {
		this.equityTooltip = new EquityTooltip();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.equityTooltip],
			styles,
		);

		this.#chart = createChart(this.element, chartOptions);
		this.#timeScale = this.#chart.timeScale();
		this.#equitySeries = this.#chart.addSeries(AreaSeries, seriesOptions);
	}

	#setupInitialState() {
		this.#chart.subscribeCrosshairMove(this.#handleCrosshairMove.bind(this));
		this.#timeScale.subscribeVisibleLogicalRangeChange(
			this.#handleVisibleLogicalRangeChange.bind(this),
		);
		this.#timeScale.subscribeSizeChange(this.#handleSizeChange.bind(this));

		requestAnimationFrame(() => {
			const rect = this.element.getBoundingClientRect();

			this.#containerLeftOffset = rect.left;
			this.#containerBottomOffset = rect.bottom;
		});
	}

	#handleCrosshairMove(param) {
		const { point, time, sourceEvent } = param;

		if (!point || !time || point.x < 0 || point.y < 0) {
			this.equityTooltip.deactivate();
			return;
		}

		if (!this.equityTooltip.isActive) {
			this.equityTooltip.activate();
		}

		this.#updateTooltipContent(param);

		if (sourceEvent) {
			this.#updateTooltipPosition(sourceEvent);
		}
	}

	#updateTooltipContent(param) {
		const { logical, seriesData } = param;
		const equityData = seriesData.get(this.#equitySeries);

		if (!equityData) return;

		this.equityTooltip.updateContent({
			deal: logical + 1,
			equity: equityData.value,
			timestamp: equityData.time,
		});
	}

	#updateTooltipPosition(sourceEvent) {
		const { clientX, clientY } = sourceEvent;
		const { width, height, offsetX } = this.equityTooltip;

		let left = clientX - this.#containerLeftOffset - width - offsetX;

		if (left < TOOLTIP_MIN_LEFT) {
			left = clientX - this.#containerLeftOffset + offsetX;
		}

		const bottom = this.#containerBottomOffset - clientY - height / 2;

		this.equityTooltip.updatePosition({ left, bottom });
	}

	#handleVisibleLogicalRangeChange(newRange) {
		const markersShouldBeVisible =
			newRange.to - newRange.from <= MARKER_RANGE_THRESHOLD;

		if (markersShouldBeVisible !== this.#markersVisible) {
			this.#markersVisible = markersShouldBeVisible;
			this.#equitySeries.applyOptions({
				pointMarkersVisible: markersShouldBeVisible,
			});
		}
	}

	#handleSizeChange() {
		this.#timeScale.fitContent();
	}
}
