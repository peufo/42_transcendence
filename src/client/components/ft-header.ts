import { getMyRendering, setMyRendering } from '../renderer/Renderer.js'
import { getAvatarSrc } from '../utils/avatar.js'
import { defineComponent } from '../utils/component.js'
import { $user } from '../utils/store.js'

defineComponent('ft-header', () => ({
	render() {
		const user = $user.get()
		return /*html*/ `
				<header class="flex items-center p-2 pl-4 gap-2 border-b border-indigo-100">
					<a href="${user ? '/me' : '/'}" class="text-2xl text-indigo-600">Transcendance</a>
					<div class="flex-grow"></div>
					<label class="inline-flex items-center cursor-pointer col-span-2 flex flex-row items-center justify-center mr-2">
						<input id="renderer" type="checkbox" class="sr-only peer" ${getMyRendering() === '3D' ? 'checked' : ''}>
						<div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
						<span class="ms-3 text-sm" id="render-type">${getMyRendering()}</span>
					</label>
					<ft-user-menu></ft-user-menu>
				</header>
			`
	},
	postRender(element) {
		const rendererCheckbox =
			element.querySelector<HTMLInputElement>('#renderer')
		const renderSpan = element.querySelector<HTMLSpanElement>('#render-type')
		if (!rendererCheckbox || !renderSpan) return
		rendererCheckbox.addEventListener('click', () => {
			const selection = rendererCheckbox.checked ? '3D' : '2D'
			setMyRendering(selection)
			renderSpan.innerHTML = selection
		})
	},
}))

defineComponent('ft-user-menu', () => ({
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
						<img src="${getAvatarSrc(user)}" alt="Avatar de l'utilisateur" class="h-6 w-6 -translate-x-1 rounded">
						<span>${user.name}</span>
					</button>

					<div class="dropdown-box hidden absolute w-36 right-0 rounded-md my-1" role="menu"
						aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
						<a href="/" class="menu-item" role="menuitem" tabindex="-1">
							<ft-icon name="home" class="h-5"></ft-icon>
							Home
						</a>
						<a href="/stats" class="menu-item" role="menuitem" tabindex="-1">
							<ft-icon name="ranking" class="h-5"></ft-icon>
							Statistics
						</a>
						<a href="/account" class="menu-item" role="menuitem" tabindex="-1">
							<ft-icon name="user" class="h-5"></ft-icon>
							Account
						</a>
						<form method="post" action="/auth/logout">
							<button type="submit" class="menu-item w-full" role="menuitem" tabindex="-1">
								<ft-icon name="log-out" class="h-5"></ft-icon>
								Logout
							</button>
						</form>
					</div>
				</ft-dropdown>`
	},
}))

defineComponent('ft-dropdown', () => ({
	onLoad(element) {
		let isActive = false
		let timeoutId: NodeJS.Timeout | null = null
		const button = element.querySelector<HTMLButtonElement>('button')
		const box = element.querySelector<HTMLDivElement>('.dropdown-box')
		const setActive = (value: boolean) => {
			isActive = value
			if (!box) return
			if (isActive) {
				box.classList.add('block')
				box.classList.remove('hidden')
			} else {
				box.classList.remove('block')
				box.classList.add('hidden')
			}
		}

		element.classList.add('relative')
		if (!button || !box)
			throw new Error(
				'ft-dropdown need a button and a div.dropdown-box as children',
			)
		button.addEventListener('click', () => {
			setActive(!isActive)
		})

		element.addEventListener('mouseenter', () => {
			if (timeoutId) {
				clearTimeout(timeoutId)
				timeoutId = null
			}
		})
		element.addEventListener('mouseleave', () => {
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
			timeoutId = setTimeout(() => setActive(false), 500)
		})
	},
}))
