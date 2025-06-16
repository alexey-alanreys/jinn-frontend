export class BaseComponent {
	/**
	 * Render the component content.
	 * @returns {HTMLElement}
	 */
	render() {
		throw new Error('Render method must be implemented in the child class');
	}
}
