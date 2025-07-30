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
                <div class ="w-32 h-32">
                    <img id="avatarPlaceholderImage" src="https://api.dicebear.com/9.x/avataaars/svg?seed=${this.seed}">
                    <input type="hidden" name="avatarPlaceholder" id="avatarPlaceholderInput" value="https://api.dicebear.com/9.x/avataaars/svg?seed=${this.seed}">
                </div>
                <div class="flex justify-center p-2 gap-2">
                    <button type="button" id="prev" class="btn btn-primary">
                        <ft-icon name="arrow-left" class="fill-transparent h-5"></ft-icon>  
                    </button>

                    <button type="button" id="next" class="btn btn-primary">
                        <ft-icon name="arrow-right" class="fill-transparent h-5"></ft-icon> 
                    </button>
                </div>
            `
		}
	},
)
