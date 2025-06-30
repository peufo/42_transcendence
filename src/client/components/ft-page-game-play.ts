customElements.define(
	'ft-page-game-play',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <ft-pong-remote></ft-pong-remote>
			`
		}
	},
)
