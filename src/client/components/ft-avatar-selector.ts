import { defineComponent } from '../utils/component.js'

defineComponent('ft-avatar-selector', () => {
	let seed = Math.random()

	return {
		postRender(element) {
			const avatarPlaceholderImage = element.querySelector<HTMLImageElement>(
				'#avatar-placeholder-image',
			)
			const avatarPlaceholderInput = element.querySelector<HTMLInputElement>(
				'#avatar-placeholder-input',
			)

			if (avatarPlaceholderImage && avatarPlaceholderInput) {
				element.querySelector('#next')?.addEventListener('click', () => {
					seed++
					avatarPlaceholderImage.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
					avatarPlaceholderInput.value = avatarPlaceholderImage.src
				})
				element.querySelector('#prev')?.addEventListener('click', () => {
					seed--
					avatarPlaceholderImage.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
					avatarPlaceholderInput.value = avatarPlaceholderImage.src
				})
			}
		},
		render() {
			return /*html*/ `
				<div class="flex flex-col gap-2 items-center">
					<div class ="w-28 h-28">
						<img id="avatar-placeholder-image" src="https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}">
						<input type="hidden" name="avatarPlaceholder" id="avatar-placeholder-input" value="https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}">
					</div>
					<div class="flex gap-2">
						<button type="button" id="prev" class="btn btn-primary">
							<ft-icon name="arrow-left" class="fill-transparent h-5"></ft-icon>
						</button>

						<button type="button" id="next" class="btn btn-primary">
							<ft-icon name="arrow-right" class="fill-transparent h-5"></ft-icon>
						</button>
					</div>
				</div>
            `
		},
	}
})
