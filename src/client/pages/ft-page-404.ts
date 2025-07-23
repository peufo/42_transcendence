customElements.define(
	'ft-page-404',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
				<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
					<div class="sm:mx-auto sm:w-full sm:max-w-sm">
						<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
							404 not found
						</h2>
					</div>
				</div>
			`
		}
	},
)
