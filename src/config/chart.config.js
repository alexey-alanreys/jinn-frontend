const chartOptions = {
	autoSize: true,
	layout: {
		background: { type: 'solid', color: '#fff' },
		textColor: '#212529',
		attributionLogo: false,
	},
	rightPriceScale: {
		scaleMargins: { top: 0.05, bottom: 0.05 },
		borderVisible: false,
	},
	crosshair: {
		mode: 0,
		vertLine: { color: '#a5a5a5', style: 3 },
		horzLine: { color: '#a5a5a5', style: 3 },
	},
	grid: {
		vertLines: { color: '#edf0ee' },
		horzLines: { color: '#edf0ee' },
	},

	// localization: {
	// 	timeFormatter: (time) => {
	// 		const date = new Date(time * 1000);
	// 		const dayOfWeek = daysOfWeek[date.getUTCDay()];
	// 		const day = date.getUTCDate();
	// 		const month = months[date.getUTCMonth()];
	// 		const year = date.getUTCFullYear();
	// 		const hours = String(date.getUTCHours()).padStart(2, '0');
	// 		const minutes = String(date.getUTCMinutes()).padStart(2, '0');
	// 		return `${dayOfWeek} ${day} ${month} ${year}   ${hours}:${minutes}`;
	// 	},
	// },
	timeScale: {
		rightOffset: 5,
		barSpacing: 8,
		minBarSpacing: 2,
		borderVisible: false,
		rightBarStaysOnScroll: true,

		// tickMarkFormatter: (time) => {
		// 	const date = new Date(time * 1000);
		// 	const day = date.getUTCDate();
		// 	const month = date.getUTCMonth();
		// 	const year = date.getUTCFullYear();
		// 	const hours = date.getUTCHours();
		// 	const minutes = date.getUTCMinutes();

		// 	if (month === 0 && day === 1 && hours === 0 && minutes === 0) {
		// 		return String(year);
		// 	}

		// 	if (day === 1 && hours === 0 && minutes === 0) {
		// 		return months[month];
		// 	}

		// 	if (hours === 0 && minutes === 0) {
		// 		return String(day);
		// 	}

		// 	const formattedHours = String(hours).padStart(2, '0');
		// 	const formattedMinutes = String(minutes).padStart(2, '0');
		// 	return `${formattedHours}:${formattedMinutes}`;
		// },
	},
};

const candlestickOptions = {
	upColor: '#008984',
	downColor: '#f23645',
	borderVisible: false,
	wickUpColor: '#008984',
	wickDownColor: '#f23645',
};

const indicatorOptions = {
	lineWidth: 2,
	lastValueVisible: false,
	priceLineVisible: false,
	crosshairMarkerVisible: false,
};

export { chartOptions, candlestickOptions, indicatorOptions };
