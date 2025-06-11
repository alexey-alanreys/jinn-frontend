export class BaseComponent {
	constructor(props = {}) {
		this.props = props;
	}

	/**
	 * Render the component content.
	 * @returns {HTMLElement}
	 */
	render() {
		throw new Error('Render method must be implemented in the child class');
	}
}
