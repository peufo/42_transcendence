import { createEffect } from '../signal.js'
import { getUser } from '../store.js'

customElements.define(
	'ft-header',
	class extends HTMLElement {
		constructor() {
			super()
			this.innerHTML = /*html*/ `
				<header class="flex items-center p-2 pl-4 gap-2 border-b border-indigo-100">
					<a href="/" class="text-2xl text-blue-600">Transcendance</a>
					<div class="flex-grow"></div>
					<ft-user-menu></ft-user-menu>
				</header>
			`
		}
	},
)

customElements.define(
	'ft-user-menu',
	class extends HTMLElement {
		constructor() {
			super()
			createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		render(): string {
			const user = getUser()

			if (!user) {
				return /*html*/ `
					<a href="/login" class="btn btn-border flex shrink-0 flex-nowrap">
						<i data-lucide="user"></i>
						<span>Login</span>
					</a>`
			}

			return /*html*/ `
				<div class="relative" data-dropdown="container">
					<button class="btn btn-border flex shrink-0 flex-nowrap">
						<i data-lucide="user"></i>
						<span>${user.name}</span>
					</button>
					<div class="dropdown-box hidden absolute w-36 right-0 rounded-md my-1" role="menu"
						aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
						<a href="/" class="menu-item" role="menuitem" tabindex="-1">
							<i data-lucide="home" class="h-5"></i>
							Home
						</a>
						<a href="/stats" class="menu-item" role="menuitem" tabindex="-1">
							<i data-lucide="chart-spline" class="h-5"></i>
							History
						</a>
						<form method="post" action="/auth/logout">
							<button type="submit" class="menu-item w-full" role="menuitem" tabindex="-1">
								<i data-lucide="log-out" class="h-5"></i>
								Logout
							</button>
						</form>
					</div>
				</div>`
		}
	},
)
