customElements.define(
	'ft-icon',
	class extends HTMLElement {
		name: string
		svgClass: string

		constructor() {
			super()
			this.name = this.getAttribute('name') || 'file-x'
			this.svgClass = this.classList.value
			this.classList.remove(...this.classList)
			this.classList.add('content')
			this.render()
		}

		async render() {
			const iconUrl = `/public/icons/${this.getAttribute('name') || 'file-x'}.svg`
			const res = await fetch(iconUrl)
			if (!res.ok) {
				return
			}
			const iconSVG = await res.text()
			this.innerHTML = iconSVG
			if (this.svgClass) {
				const svg = this.querySelector('svg')
				svg?.classList.add(...this.svgClass.split(' '))
			}
		}
	},
)
