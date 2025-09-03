customElements.define(
	'ft-page-remote-new',
	class extends HTMLElement {
		connectedCallback() {
			// TODO: points to win select
			this.innerHTML = /*html*/ `
                <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Versus settings</h2>
                </div>
				<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form action="/remote/new" method="post" class="space-y-6">
                        <button type="submit" class="btn btn-primary w-full">
                            Create versus
                        </button>
                    </form>
                </div>
			`
		}
	},
)
