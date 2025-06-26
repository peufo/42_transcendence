customElements.define(
	'ft-page-local-play',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
			    <ft-pong></ft-pong>
			`
		}
	},
)
