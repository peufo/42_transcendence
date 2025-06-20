customElements.define(
	'ft-icon',
	class extends HTMLElement {
		static observedAttributes = ['src']

		attributeChangedCallback(name) {
			if (name === 'src') {
				this.loadIcon()
			}
		}

		async loadIcon() {
			const iconUrl = `/public/icons/${this.getAttribute('src') || 'file-x'}.svg`
			const res = await fetch(iconUrl)
			if (!res.ok) {
				return
			}
			const iconSVG = await res.text()
			this.innerHTML = iconSVG
		}
	},
)
