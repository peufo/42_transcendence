import { Engine } from '../../lib/engine/index.js'
import { defineComponent } from '../utils/component.js'
import { type Renderer, Renderer2D } from '../utils/renderer.js'

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
			renderer = new Renderer2D(element)
			const urlParams = new URLSearchParams(window.location.search)
			renderer.setPlayerNames({
				p1: urlParams.get('player1') ?? undefined,
				p2: urlParams.get('player2') ?? undefined,
			})
			const scoreToWin = urlParams.get('scoreToWin')
			engine = new Engine({
				scoreToWin: Number(scoreToWin),
				onTick: renderer.onTick.bind(renderer),
				onRoundEnd: renderer.onRoundEnd.bind(renderer),
				onGameEnd: renderer.onGameEnd.bind(renderer),
				onCollision: renderer.onCollision.bind(renderer),
				onTimerTick: renderer.onTimerTick.bind(renderer),
				onEngineStart: renderer.onEngineStart.bind(renderer),
			})
			engine.start()
			cleanInputs = setupInputs()
		},
		onDestroy() {
			cleanInputs?.()
		},
	}
})
