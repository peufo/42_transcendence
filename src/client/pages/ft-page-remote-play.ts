customElements.define(
	'ft-page-remote-play',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = this.render()
		}

		render(): string {
			// TODO: set matchID

			return /*html*/ `
				<div class="grid grid-cols-4 gap-4 p-4 min-w-[1360px]">
					<div class="col-span-3">
						<ft-pong-remote></ft-pong-remote>
					</div>
				</div>
			`
		}
	},
)
