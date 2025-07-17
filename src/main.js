import { $Q } from '@/core/libs/query.lib';
import { automationService } from '@/core/services/automation.service';
import { initService } from '@/core/services/init.service';
import { notificationService } from '@/core/services/notification.service';

import { Layout } from '@/components/layout/layout.component';
import { Notification } from '@/components/notification/notification.component';

import '@/styles/global.css';

import { SERVER_MODE } from './config/mode.config';

class AppInitializer {
	static async start() {
		try {
			const app = $Q('#app');

			this.renderNotificationShell(app);
			await this.initializeAppState();
			this.startAutomationIfNeeded();
			this.renderApp(app);
		} catch (error) {
			this.handleFatalError(error);
		}
	}

	static renderNotificationShell(app) {
		app.append(new Notification().render());
	}

	static async initializeAppState() {
		await initService.initialize();
	}

	static renderApp(app) {
		app.append(new Layout().render());
	}

	static startAutomationIfNeeded() {
		if (SERVER_MODE === 'AUTOMATION') {
			automationService.start();
		}
	}

	static handleFatalError(error) {
		console.error('App initialization failed:', error);
		notificationService.show('error', 'Failed to launch the application');
	}
}

requestAnimationFrame(() => {
	AppInitializer.start();
});
