import { getAvatarSrc } from '../utils/avatar.js'
import { defineComponent } from '../utils/component.js'
import { $myRenderer, $user } from '../utils/store.js'

const renderingIcons: Record<'2D' | '3D', string> = {
	'2D': 'square-unit',
	'3D': 'box',
}

defineComponent('ft-header', () => ({
	render() {
		const user = $user.get()
		const rendering = $myRenderer.get(false)

		return /*html*/ `
				<header class="flex items-center p-2 pl-4 gap-2 bg-white/50">
					<a href="${user ? '/me' : '/'}" class="text-4xl text-indigo-600 font-pixel">
						TRANSCENDANCE
					</a>
					<div class="flex-grow"></div>
					<label class="cursor-pointer col-span-2 flex flex-row items-center justify-center mr-10">
						<input id="renderer" type="checkbox" class="sr-only peer" ${rendering === '3D' ? 'checked' : ''}>
						<div class="relative w-11 h-6 bg-amber-600 rounded-full
								peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white
								after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 mr-2">
						</div>
						<div class="flex flex-col items-center">
							<ft-icon id="render-type-icon" class="h-5" name="${renderingIcons[rendering]}"></ft-icon>	
							<span class="text-[0.6rem]" id="render-type-span">${rendering}</span>
						</div>
					</label>
					<ft-user-menu></ft-user-menu>
				</header>
			`
	},
	postRender(element) {
		const rendererCheckbox =
			element.querySelector<HTMLInputElement>('#renderer')
		const renderSpan =
			element.querySelector<HTMLSpanElement>('#render-type-span')
		const renderIcon = element.querySelector<HTMLElement>('#render-type-icon')
		if (!rendererCheckbox || !renderSpan || !renderIcon) {
			throw new Error('Html structure of component is not correct !')
		}
		rendererCheckbox.addEventListener('click', () => {
			const selection = rendererCheckbox.checked ? '3D' : '2D'
			$myRenderer.set(selection)
			renderSpan.innerHTML = selection
			renderIcon.setAttribute('name', renderingIcons[selection])
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
