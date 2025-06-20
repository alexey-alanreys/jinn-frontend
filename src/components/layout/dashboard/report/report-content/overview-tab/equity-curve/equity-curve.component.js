import { AreaSeries, createChart } from 'lightweight-charts';

import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import { chartOptions, seriesOptions } from '@/config/equity.config';

import styles from './equity-curve.module.css';
import templateHTML from './equity-curve.template.html?raw';

import { EquityTooltip } from './equity-tooltip/equity-tooltip.component';

export class EquityCurve extends BaseComponent {
	static #TOOLTIP_MIN_LEFT = 50;
	static #MARKER_RANGE_THRESHOLD = 100;

	#chart;
	#timeScale;
	#equitySeries;
	#markersVisible = false;

	render() {
		this.equityTooltip = new EquityTooltip();
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.equityTooltip],
			styles,
		);

		this.#chart = createChart(this.element, chartOptions);
		this.#chart.subscribeCrosshairMove(this.#handleCrosshairMove.bind(this));

		this.#timeScale = this.#chart.timeScale();
		this.#equitySeries = this.#chart.addSeries(AreaSeries, seriesOptions);

		this.#timeScale.subscribeVisibleLogicalRangeChange(
			this.#handleVisibleLogicalRangeChange.bind(this),
		);

		return this.element;
	}

	update(equity) {
		this.#equitySeries.setData(equity);
		this.#timeScale.fitContent();
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

		if (sourceEvent) {
			this.#updateTooltipPosition(sourceEvent);
		}

		this.#updateTooltipContent(param);
	}

	#updateTooltipPosition(sourceEvent) {
		const containerRect = this.element.getBoundingClientRect();

		let left =
			sourceEvent.clientX -
			containerRect.left -
			this.equityTooltip.getWidth() -
			this.equityTooltip.getOffsetX();

		if (left < EquityCurve.#TOOLTIP_MIN_LEFT) {
			left =
				sourceEvent.clientX -
				containerRect.left +
				this.equityTooltip.getOffsetX();
		}

		const bottom =
			containerRect.bottom -
			sourceEvent.clientY -
			this.equityTooltip.getHeight() / 2;

		this.equityTooltip.updatePosition({ left, bottom });
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

	#handleVisibleLogicalRangeChange(newRange) {
		const markersShouldBeVisible =
			newRange.to - newRange.from <= EquityCurve.#MARKER_RANGE_THRESHOLD;

		if (markersShouldBeVisible !== this.#markersVisible) {
			this.#markersVisible = markersShouldBeVisible;
			this.#equitySeries.applyOptions({
				pointMarkersVisible: markersShouldBeVisible,
			});
		}
	}
}
