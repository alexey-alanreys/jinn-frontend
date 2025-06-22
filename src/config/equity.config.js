const chartOptions = {
	autoSize: true,
	layout: {
		background: { type: 'solid', color: '#fff' },
		textColor: '#292121',
		fontFamily: 'system-ui, sans-serif',
		attributionLogo: false,
	},
	rightPriceScale: {
		scaleMargins: { top: 0.05, bottom: 0.05 },
		borderVisible: false,
		entireTextOnly: true,
	},
	crosshair: {
		vertLine: {
			color: '#e8e8e8',
			style: 0,
			labelVisible: false,
		},
		horzLine: {
			visible: false,
			labelVisible: false,
		},
	},
	grid: {
		vertLines: { visible: false },
		horzLines: { visible: false },
	},
	timeScale: {
		maxBarSpacing: 50,
		fixLeftEdge: true,
		fixRightEdge: true,
		lockVisibleTimeRangeOnResize: true,
		borderVisible: false,

		tickMarkFormatter: (time, tickMarkType) => {
			const date = new Date(time * 1000);

			const year = String(date.getUTCFullYear());
			const month = date.toLocaleString('ru-RU', { month: 'short' });
			const day = String(date.getUTCDate());

			if (tickMarkType === 0) {
				return String(year);
			}

			if (tickMarkType === 1) {
				return month;
			}

			if (tickMarkType === 2) {
				return day;
			}
		},
	},
};

const seriesOptions = {
	lastValueVisible: false,
	priceLineVisible: false,

	topColor: '#78CEFF',
	bottomColor: '#EBF5FB',
	lineColor: '#00A9FF',
	lineWidth: 3,
	crosshairMarkerBorderColor: '#fff',
	crosshairMarkerBorderWidth: 3,
};

export { chartOptions, seriesOptions };
