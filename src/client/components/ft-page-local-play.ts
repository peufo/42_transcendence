import '../engine/index.js'

customElements.define(
	'ft-page-local-play',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
				<canvas id="canvas" width="700" height="700"></canvas>
			`
		}
	},
)
