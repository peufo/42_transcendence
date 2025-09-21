import { defineComponent } from '../utils/component.js'

defineComponent('ft-title', () => ({
	onLoad(element) {
		element.classList.add('relative', 'text-center', 'my-6', 'block')
		const bg = element.querySelector<HTMLHeadElement>('h2.absolute')
		if (!bg) {
			throw new Error('Component structure error')
		}
		const delta = { x: 0, y: 0 }
		const divider = 80

		const getOrigin = () => {
			const rect = element.getBoundingClientRect()
			return {
				x: rect.x + rect.width / 2,
				y: rect.y + rect.height / 2,
			}
		}

		const trackMousePosition = ({ x, y }: MouseEvent) => {
			const origin = getOrigin()
			delta.x = (x - origin.x) / divider
			delta.y = (y - origin.y) / divider
			bg.style.translate = `${-delta.x}px ${-delta.y}px`
		}
		document.addEventListener('mousemove', trackMousePosition)
		return () => {
			document.removeEventListener('mousemove', trackMousePosition)
		}
	},
	render: () => /*html*/ `
		<h2 class="font-pixel absolute w-full left-0 -z-10 text-4xl text-amber-600/50">
			ENTER IN THE GAME
		</h2>
		<h2 class="font-pixel text-4xl text-indigo-600">
			ENTER IN THE GAME
		</h2>
	`,
}))
