//import '../engine/index.js'

customElements.define(
	'ft-page-local-play',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
			    <script type="module" src="/public/client/engine/index.js"></script>
    			<canvas id="canvas" width="700" height="700"></canvas>
			`
		}
	},
)
