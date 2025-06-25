customElements.define(
	'ft-pong',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
				<script type="module" src="/public/client/engine/index.js"></script>
				<div class="grid place-items-center">
					<canvas class="border" id="canvas" width="700" height="700"></canvas>
				</div>
			`
		}
	},
)
