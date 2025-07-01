import { getCssVariable } from '@/utils/css-variable.util';

export const getChartOptions = () => {
	return {
		autoSize: true,
		layout: {
			background: {
				type: 'solid',
				color: getCssVariable('--color-bg-primary') || '#ffffff',
			},
			textColor: getCssVariable('--color-text-primary') || '#292121',
			fontFamily: 'system-ui, sans-serif',
			attributionLogo: false,
		},
		rightPriceScale: {
			scaleMargins: { top: 0.1, bottom: 0.05 },
			borderVisible: false,
			entireTextOnly: true,
		},
		crosshair: {
			mode: 0,
			vertLine: {
				color: getCssVariable('--color-chart-crosshair-line') || '#a5a5a5',
				style: 3,
				labelBackgroundColor:
					getCssVariable('--color-chart-crosshair-label') || '#2e2e2e',
			},
			horzLine: {
				color: getCssVariable('--color-chart-crosshair-line') || '#a5a5a5',
				style: 3,
				labelBackgroundColor:
					getCssVariable('--color-chart-crosshair-label') || '#2e2e2e',
			},
		},
		grid: {
			vertLines: { color: getCssVariable('--color-chart-grid') || '#edf0ee' },
			horzLines: { color: getCssVariable('--color-chart-grid') || '#edf0ee' },
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
};

export const getCandlestickOptions = () => {
	return {
		borderVisible: false,
		upColor: getCssVariable('--color-chart-up') || '#008984',
		downColor: getCssVariable('--color-chart-down') || '#f23645',
		wickUpColor: getCssVariable('--color-chart-up') || '#008984',
		wickDownColor: getCssVariable('--color-chart-down') || '#f23645',
	};
};

export const getLineOptions = () => {
	return {
		lastValueVisible: false,
		priceLineVisible: false,
		color: getCssVariable('--color-chart-line') || '#3b6cb7',
		lineWidth: 2,
		crosshairMarkerVisible: false,
	};
};
