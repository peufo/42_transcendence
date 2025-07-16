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

							<div class="grid grid-cols-2 gap-2">
								<a href="/local/new" class="btn btn-primary">
									<ft-icon name="swords" class="h-5 w-5 mr-1"></ft-icon>
									Local game
								</a>
								<a href="/game/new" class="btn btn-primary">
									<ft-icon name="trophy" class="h-5 w-5 mr-1"></ft-icon>
									New tournament
								</a>
							</div>
						</div>
					</div>
				</div>
			`
		}
	},
)
