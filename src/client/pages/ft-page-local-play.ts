customElements.define(
	'ft-page-local-play',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
				<div class="p-4 pt-10">
					<ft-pong-local></ft-pong-local>
				</div>
			`
		}
	},
)
