customElements.define(
	'ft-page-index',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = this.render()
		}
		render(): string {
			return /*html*/ `
				<div class="flex min-h-full flex-col justify-center p-6 lg:px-8">
					<div class="flex flex-col gap-10 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
						<div>
							<h3 class="font-semibold text-xl text-gray-900 text-center my-8">
								Welcome
							</h3>

							<ft-game-selection></ft-game-selection>
						</div>
					</div>
				</div>
			`
		}
	},
)
