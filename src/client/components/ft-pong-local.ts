import { Engine } from '../../lib/engine/index.js'
import type { Renderer } from '../renderer/Renderer.js'
import { Renderer2D } from '../renderer/Renderer2D.js'
import { Renderer3D } from '../renderer/Renderer3D.js'
import { defineComponent } from '../utils/component.js'
import { $myRenderer } from '../utils/store.js'

defineComponent('ft-pong-local', () => {
	let renderer: Renderer
	let engine: Engine
	let cleanInputs: (() => void) | undefined

	function setupInputs() {
		const keyHandlers: Record<string, (value: boolean) => void> = {
			w: (value) => engine.setInput('p1', 'up', value),
			s: (value) => engine.setInput('p1', 'down', value),
			d: (value) => engine.setInput('p1', 'down', value),
			a: (value) => engine.setInput('p1', 'up', value),
			i: (value) => engine.setInput('p2', 'up', value),
			k: (value) => engine.setInput('p2', 'down', value),
			l: (value) => engine.setInput('p2', 'down', value),
			j: (value) => engine.setInput('p2', 'up', value),
		}

		const onKeyDown = (event: KeyboardEvent) => {
			keyHandlers[event.key]?.(true)
		}
		const onKeyUp = (event: KeyboardEvent) => {
			keyHandlers[event.key]?.(false)
		}

		document.addEventListener('keydown', onKeyDown)
		document.addEventListener('keyup', onKeyUp)

		return () => {
			document.removeEventListener('keydown', onKeyDown)
			document.removeEventListener('keyup', onKeyUp)
			return
		}
	}

	return {
		postRender(element) {
			element.classList.add('grid', 'place-items-center')
			const urlParams = new URLSearchParams(window.location.search)
			const names = {
				p1: urlParams.get('player1') ?? 'Player 1',
				p2: urlParams.get('player2') ?? 'Player 2',
			}
			renderer?.clear()
			renderer =
				$myRenderer.get() === '2D'
					? new Renderer2D(element, names, { p1: 0, p2: 0 })
					: new Renderer3D(element, names, { p1: 0, p2: 0 })
			const pointsToWin = urlParams.get('points-to-win')
			engine = new Engine({
				pointsToWin: Number(pointsToWin),
				onTick: renderer.onTick.bind(renderer),
				onRoundEnd: renderer.onRoundEnd.bind(renderer),
				onGameEnd: renderer.onGameEnd.bind(renderer),
				onCollision: renderer.onCollision.bind(renderer),
				onTimerTick: renderer.onTimerTick.bind(renderer),
			})
			engine.start()
			cleanInputs = setupInputs()
		},
		onDestroy() {
			cleanInputs?.()
		},
	}
})
