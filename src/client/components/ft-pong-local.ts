import { Engine } from '../../lib/engine/index.js'
import { defineComponent } from '../utils/component.js'
import { type Renderer, renderer2D } from '../utils/renderer.js'

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
		onLoad(element) {
			element.classList.add('grid', 'place-items-center')
			renderer = renderer2D(element)
			const urlParams = new URLSearchParams(window.location.search)
			renderer.setPlayerNames({
				p1: urlParams.get('player1'),
				p2: urlParams.get('player2'),
			})
			const scoreToWin = urlParams.get('scoreToWin')
			engine = new Engine({
				scoreToWin: Number(scoreToWin),
				onEngineStart: () => renderer.onEngineStart(),
				onTimerTick: (data) => renderer.onTimerTick(data),
				onTick: (data) => renderer.onTick(data),
				onCollision: (data) => renderer.onCollision(data),
				onRoundEnd: (data) => renderer.onRoundEnd(data),
				onGameEnd: (data) => renderer.onGameEnd(data),
			})
			engine.start()
			cleanInputs = setupInputs()
		},
		onDestroy() {
			cleanInputs?.()
		},
	}
})
