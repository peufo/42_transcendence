import { defineComponent } from '../utils/component.js'

defineComponent('ft-avatar-selector', () => {
	let seed = Math.random()

	return {
		onLoad(element) {
			const avatarPlaceholderImage = element.querySelector<HTMLImageElement>(
				'#avatarPlaceholderImage',
			)
			const avatarPlaceholderInput = element.querySelector<HTMLInputElement>(
				'#avatarPlaceholderInput',
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
						<img id="avatarPlaceholderImage" src="https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}">
						<input type="hidden" name="avatarPlaceholder" id="avatarPlaceholderInput" value="https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}">
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
