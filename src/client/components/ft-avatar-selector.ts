customElements.define(
	'ft-avatar-selector',
	class extends HTMLElement {
		seed: number = 0

		connectedCallback() {
			this.innerHTML = this.render()
			const avatarPlaceholderImage = this.querySelector<HTMLImageElement>(
				'#avatarPlaceholderImage',
			)
			const avatarPlaceholderInput = this.querySelector<HTMLInputElement>(
				'#avatarPlaceholderInput',
			)

			if (avatarPlaceholderImage && avatarPlaceholderInput) {
				this.querySelector('#next')?.addEventListener('click', () => {
					this.seed++
					avatarPlaceholderImage.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${this.seed}`
					avatarPlaceholderInput.value = avatarPlaceholderImage.src
				})
				this.querySelector('#prev')?.addEventListener('click', () => {
					this.seed--
					avatarPlaceholderImage.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${this.seed}`
					avatarPlaceholderInput.value = avatarPlaceholderImage.src
				})
			}
		}

		render() {
			return /*html*/ `
				<div class="flex flex-col gap-2 items-center">
					<div class ="w-28 h-28">
						<img id="avatarPlaceholderImage" src="https://api.dicebear.com/9.x/avataaars/svg?seed=${this.seed}">
						<input type="hidden" name="avatarPlaceholder" id="avatarPlaceholderInput" value="https://api.dicebear.com/9.x/avataaars/svg?seed=${this.seed}">
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
		}
	},
)
