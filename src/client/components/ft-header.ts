import { type CleanEffect, createEffect } from '../utils/signal.js'
import { $user } from '../utils/store.js'

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
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
		}

		render(): string {
			const user = $user.get()

			if (!user) {
				return /*html*/ `
					<a href="/login" class="btn btn-border flex shrink-0 flex-nowrap">
						<ft-icon name="user"></ft-icon>
						<span>Login</span>
					</a>`
			}

			return /*html*/ `
				<ft-dropdown>
					<button class="btn btn-border flex shrink-0 flex-nowrap">
						<ft-icon name="user"></ft-icon>
						<span>${user.name}</span>
					</button>
					
					<div class="dropdown-box hidden absolute w-36 right-0 rounded-md my-1" role="menu"
						aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
						<a href="/" class="menu-item" role="menuitem" tabindex="-1">
							<ft-icon name="home" class="h-5"></ft-icon>
							Home
						</a>
						<a href="/stats" class="menu-item" role="menuitem" tabindex="-1">
							<ft-icon name="chart-spline" 	class="h-5"></ft-icon>
							History
						</a>
						<form method="post" action="/auth/logout">
							<button type="submit" class="menu-item w-full" role="menuitem" tabindex="-1">
								<ft-icon name="log-out" class="h-5"></ft-icon>
								Logout
							</button>
						</form>
					</div>
				</ft-dropdown>`
		}
	},
)

customElements.define(
	'ft-dropdown',
	class extends HTMLElement {
		isActive = false
		timeoutId: NodeJS.Timeout | null = null
		box: HTMLDivElement

		constructor() {
			super()
			this.classList.add('relative')
			const button = this.querySelector<HTMLButtonElement>('button')
			const box = this.querySelector<HTMLDivElement>('.dropdown-box')
			if (!button || !box)
				throw new Error(
					'ft-dropdown need a button and a div.dropdown-box as children',
				)
			this.box = box
			button.addEventListener('click', () => {
				this.setActive(!this.isActive)
			})

			this.addEventListener('mouseenter', () => {
				if (this.timeoutId) {
					clearTimeout(this.timeoutId)
					this.timeoutId = null
				}
			})
			this.addEventListener('mouseleave', () => {
				if (this.timeoutId) {
					clearTimeout(this.timeoutId)
				}
				this.timeoutId = setTimeout(() => this.setActive(false), 500)
			})
		}

		setActive(value: boolean) {
			this.isActive = value
			if (!this.box) return
			if (this.isActive) {
				this.box.classList.add('block')
				this.box.classList.remove('hidden')
			} else {
				this.box.classList.remove('block')
				this.box.classList.add('hidden')
			}
		}
	},
)
