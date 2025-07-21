customElements.define(
	'ft-page-tournament-play',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <ft-pong-remote></ft-pong-remote>
			`
		}
	},
)
