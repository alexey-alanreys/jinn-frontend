const equityChartOptions = {
	autoSize: true,
	layout: {
		background: { type: 'solid', color: '#FFFFFF' },
		textColor: 'black',
		fontSize: 12,
		attributionLogo: false,
	},
	rightPriceScale: {
		visible: false,
	},
	leftPriceScale: {
		scaleMargins: { top: 0.05, bottom: 0.05 },
		borderVisible: false,
		visible: true,
	},
	crosshair: {
		mode: 0,
		vertLine: {
			color: '#A5A5A5',
			style: 3,
		},
		horzLine: {
			color: '#A5A5A5',
			style: 3,
		},
	},
	grid: {
		vertLines: { visible: false },
		horzLines: { visible: false },
	},
	handleScroll: {
		mouseWheel: false,
		pressedMouseMove: false,
		horzTouchDrag: false,
		vertTouchDrag: false,
	},
	handleScale: {
		mouseWheel: false,
		pinch: false,
		axisPressedMouseMove: false,
		axisDoubleClickReset: false,
	},
	timeScale: {
		rightOffset: 1,
		borderVisible: false,
		allowBoldLabels: false,
	},
};

const equityAreaSeriesOptions = {
	lineColor: '#00A9FF',
	lineWidth: 1,
	topColor: '#78CEFF',
	bottomColor: '#EBF5FB',
	lineVisible: true,
	crosshairMarkerVisible: false,
	lastValueVisible: false,
	priceLineVisible: false,
};

export { equityChartOptions, equityAreaSeriesOptions };
