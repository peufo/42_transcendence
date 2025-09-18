import { defineComponent } from '../utils/component.js'

const cache: Record<string, Promise<string>> = {}

defineComponent(
	'ft-icon',
	() => {
		let svgClass: string

		return {
			onLoad(element) {
				svgClass = element.classList.value
				element.classList.remove(...element.classList)
				element.classList.add('contents')
			},
			async postRender(element) {
				const iconUrl = `/public/icons/${element.getAttribute('name') || 'file-x'}.svg`
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
				element.innerHTML = iconSVG
				if (svgClass) {
					const svg = element.querySelector('svg')
					svg?.classList.add(...svgClass.split(' '))
				}
			},
		}
	},
	'name',
)
