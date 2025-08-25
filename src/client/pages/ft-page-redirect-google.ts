// import { $oauth2 } from '../utils/store.js'

customElements.define(
	'ft-page-redirect-google',
	class extends HTMLElement {
		async connectedCallback() {
			this.innerHTML = /*html*/ `
				<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
					<div class="sm:mx-auto sm:w-full sm:max-w-sm">
						<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 animate-pulse">
							Redirecting to google login...
						</h2>
					</div>
				</div>
			`
			window.location.href = 'http://localhost:8000/auth/oauth/google'
		}
	},
)
