import { AreaSeries, createChart } from 'lightweight-charts';

import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
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
	#$element;

	#chart;
	#timeScale;
	#equitySeries;

	#markersVisible = false;

	#previousWidth;
	#containerLeftOffset;
	#containerBottomOffset;

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	update(equity) {
		if (equity.length !== 0) {
			this.#show();

			this.#equitySeries.setData(equity);
			this.#timeScale.fitContent();
		} else {
			this.#hide();
		}
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
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#chart = createChart(this.element, chartOptions);
		this.#timeScale = this.#chart.timeScale();
		this.#equitySeries = this.#chart.addSeries(AreaSeries, seriesOptions);

		this.#chart.subscribeCrosshairMove(this.#handleCrosshairMove.bind(this));
		this.#timeScale.subscribeVisibleLogicalRangeChange(
			this.#handleVisibleLogicalRangeChange.bind(this),
		);

		const resizeObserver = new ResizeObserver(
			this.#handleSizeChange.bind(this),
		);
		resizeObserver.observe(this.element);

		requestAnimationFrame(() => {
			const rect = this.element.getBoundingClientRect();

			this.#previousWidth = rect.width;
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

	#handleSizeChange(entries) {
		for (const entry of entries) {
			const newWidth = entry.contentRect.width;

			if (newWidth !== this.#previousWidth) {
				this.#previousWidth = newWidth;
				this.#timeScale.fitContent();
			}
		}
	}

	#hide() {
		this.#$element.css('display', 'none');
	}

	#show() {
		this.#$element.css('display', 'block');
	}
}
