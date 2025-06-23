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
		mode: 0,
		vertLine: { color: '#a5a5a5', style: 3, labelBackgroundColor: '#1e1e1e' },
		horzLine: { color: '#a5a5a5', style: 3, labelBackgroundColor: '#1e1e1e' },
	},
	grid: {
		vertLines: { color: '#edf0ee' },
		horzLines: { color: '#edf0ee' },
	},
	timeScale: {
		rightOffset: 5,
		barSpacing: 8,
		minBarSpacing: 2,
		borderVisible: false,
		rightBarStaysOnScroll: true,

		tickMarkFormatter: (time) => {
			const date = new Date(time * 1000);

			const day = date.getUTCDate();
			const month = date.getUTCMonth();
			const year = date.getUTCFullYear();
			const hours = date.getUTCHours();
			const minutes = date.getUTCMinutes();

			if (month === 0 && day === 1 && hours === 0 && minutes === 0) {
				return String(year);
			}

			if (day === 1 && hours === 0 && minutes === 0) {
				return date
					.toLocaleString('ru-RU', { month: 'short' })
					.replace('.', '')
					.slice(0, 3);
			}

			if (hours === 0 && minutes === 0) {
				return String(day);
			}

			const formattedHours = String(hours).padStart(2, '0');
			const formattedMinutes = String(minutes).padStart(2, '0');

			return `${formattedHours}:${formattedMinutes}`;
		},
	},
	localization: {
		timeFormatter: (time) => {
			const date = new Date(time * 1000);

			const dayOfWeek = date
				.toLocaleString('ru-RU', { weekday: 'short' })
				.toLowerCase();
			const day = date.getUTCDate();
			const month = date
				.toLocaleString('ru-RU', {
					month: 'short',
				})
				.replace('.', '')
				.slice(0, 3);
			const year = date.toLocaleString('ru-RU', { year: '2-digit' });
			const hours = String(date.getUTCHours()).padStart(2, '0');
			const minutes = String(date.getUTCMinutes()).padStart(2, '0');

			return `${dayOfWeek} ${day} ${month} ${year}  ${hours}:${minutes}`;
		},
	},
};

const candlestickStyleOptions = {
	upColor: '#008984',
	downColor: '#f23645',
	borderVisible: false,
	wickUpColor: '#008984',
	wickDownColor: '#f23645',
};

const lineStyleOptions = {
	lastValueVisible: false,
	priceLineVisible: false,
	lineWidth: 2,
	crosshairMarkerVisible: false,
};

export { chartOptions, candlestickStyleOptions, lineStyleOptions };
