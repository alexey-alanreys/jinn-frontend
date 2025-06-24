import { $Q } from '@/core/libs/query.lib';
import { initService } from '@/core/services/init.service';
import { notificationService } from '@/core/services/notification.service';

import { Layout } from '@/components/layout/layout.component';
import { Notification } from '@/components/notification/notification.component';

import '@/styles/global.css';

class AppInitializer {
	static async start() {
		try {
			const app = $Q('#app');

			this.renderNotificationShell(app);
			await initService.initialize();
			this.renderApp(app);
		} catch (error) {
			this.handleFatalError(error);
		}
	}

	static renderNotificationShell(app) {
		app.append(new Notification().render());
	}

	static renderApp(app) {
		app.append(new Layout().render());
	}

	static handleFatalError(error) {
		console.error('App initialization failed:', error);
		notificationService.show('error', 'Не удалось запустить приложение');
	}
}

AppInitializer.start();
