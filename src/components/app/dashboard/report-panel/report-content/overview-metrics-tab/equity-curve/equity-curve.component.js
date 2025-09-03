import { AreaSeries, createChart } from 'lightweight-charts';

import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import {
	getAreaOptions,
	getEquityCurveOptions,
} from '@/config/equity-curve.config';

import { MARKER_RANGE_THRESHOLD } from '@/constants/equity-curve.constants';
import { TOOLTIP_MIN_LEFT } from '@/constants/equity-tooltip.constants';
import { STATE_KEYS } from '@/constants/state-keys.constants';

import styles from './equity-curve.module.css';
import templateHTML from './equity-curve.template.html?raw';

import { EquityTooltip } from './equity-tooltip/equity-tooltip.component';

export class EquityCurve extends BaseComponent {
	static COMPONENT_NAME = 'EquityCurve';

	#$element;
	#chartApi;
	#series;

	#viewportMetrics = {};
	#markersVisible = false;

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	update(equity) {
		this.#series.setData(equity);
		this.#chartApi.timeScale().fitContent();
	}

	show() {
		this.#$element.css('display', 'block');
	}

	hide() {
		this.#$element.css('display', 'none');
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
		this.#initChart();
		this.#attachListeners();
	}

	#initChart() {
		this.#chartApi = createChart(this.element);
		this.#series = this.#chartApi.addSeries(AreaSeries);

		this.#applyChartOptions();
		this.#applyAreaOptions();
	}

	#applyOptions() {
		this.#applyChartOptions();
		this.#applyAreaOptions();
	}

	#applyChartOptions() {
		const equityCurveOptions = getEquityCurveOptions();
		this.#chartApi.applyOptions(equityCurveOptions);
	}

	#applyAreaOptions() {
		const areaOptions = getAreaOptions();
		this.#series.applyOptions(areaOptions);
	}

	#attachListeners() {
		this.#chartApi.subscribeClick(this.#handleClick.bind(this));

		this.#chartApi.subscribeCrosshairMove(
			this.#handleCrosshairMove.bind(this),
		);

		this.#chartApi
			.timeScale()
			.subscribeVisibleLogicalRangeChange(
				this.#handleVisibleLogicalRangeChange.bind(this),
			);

		stateService.subscribe(STATE_KEYS.THEME, this.#applyOptions.bind(this));
	}

	#handleClick({ time }) {
		stateService.set(STATE_KEYS.SELECTED_TIME, time);
	}

	#handleCrosshairMove(param) {
		const { point, time, sourceEvent } = param;

		if (!point || !time || point.x < 0 || point.y < 0) {
			this.equityTooltip.deactivate();
			return;
		}

		if (!this.equityTooltip.isActive) {
			this.#viewportMetrics = this.#getViewportMetrics();
			this.equityTooltip.activate();
		}

		this.#updateTooltipContent(param);

		if (sourceEvent) {
			this.#updateTooltipPosition(sourceEvent);
		}
	}

	#updateTooltipContent(param) {
		const { logical, seriesData } = param;
		const equityData = seriesData.get(this.#series);

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

		const bottom = this.#viewportMetrics.height - clientY - height / 2;
		let left = clientX - this.#viewportMetrics.left - width - offsetX;

		if (left < TOOLTIP_MIN_LEFT) {
			left = clientX - this.#viewportMetrics.left + offsetX;
		}

		this.equityTooltip.updatePosition({ left, bottom });
	}

	#handleVisibleLogicalRangeChange(newRange) {
		const markersShouldBeVisible =
			newRange.to - newRange.from <= MARKER_RANGE_THRESHOLD;

		if (markersShouldBeVisible !== this.#markersVisible) {
			this.#markersVisible = markersShouldBeVisible;
			this.#series.applyOptions({
				pointMarkersVisible: markersShouldBeVisible,
			});
		}
	}

	#getViewportMetrics() {
		return {
			left: this.element.getBoundingClientRect().left,
			height: window.innerHeight,
		};
	}
}
