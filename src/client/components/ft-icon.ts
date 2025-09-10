const cache: Record<string, Promise<string>> = {}

customElements.define(
	'ft-icon',
	class extends HTMLElement {
		name: string
		svgClass: string

		connectedCallback() {
			this.name = this.getAttribute('name') || 'file-x'
			this.svgClass = this.classList.value
			this.classList.remove(...this.classList)
			this.classList.add('contents')
			this.render()
		}

		async render() {
			const iconUrl = `/public/icons/${this.getAttribute('name') || 'file-x'}.svg`
			if (!cache[iconUrl]) {
				cache[iconUrl] = fetch(iconUrl)
					.then((res) => {
						if (!res.ok) throw new Error(`Failed to load ${iconUrl}`)
						return res.text()
					})
					.catch((err) => {
						console.error(err)
						return ''
					})
			}
			const iconSVG = await cache[iconUrl]
			if (!iconSVG) return
			this.innerHTML = iconSVG
			if (this.svgClass) {
				const svg = this.querySelector('svg')
				svg?.classList.add(...this.svgClass.split(' '))
			}
		}
	},
)
