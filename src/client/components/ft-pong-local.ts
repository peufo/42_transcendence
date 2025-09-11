import { Engine } from '../../lib/engine/index.js'
import { renderer2D } from '../utils/renderer.js'

customElements.define(
	'ft-pong-local',
	class extends HTMLElement {
		renderer = renderer2D(this)
		engine: Engine

		connectedCallback() {
			const urlParams = new URLSearchParams(window.location.search)
			this.renderer.setPlayerNames(
				urlParams.get('player1'),
				urlParams.get('player2'),
			)
			const scoreToWin = urlParams.get('scoreToWin')
			this.classList.add('grid', 'place-items-center')
			this.engine = new Engine({
				scoreToWin: Number(scoreToWin),
				onTimerTick: (data) => this.renderer.onTimerTick(data),
				onTick: (data) => this.renderer.onTick(data),
				onCollision: (data) => this.renderer.onCollision(data),
				onRoundEnd: (data) => this.renderer.onRoundEnd(data),
				onGameEnd: (data) => this.renderer.onGameEnd(data),
			})
			this.engine.start()

			const keyHandlers: Record<string, (value: boolean) => void> = {
				w: (value) => this.engine.setInput('p1', 'up', value),
				s: (value) => this.engine.setInput('p1', 'down', value),
				d: (value) => this.engine.setInput('p1', 'down', value),
				a: (value) => this.engine.setInput('p1', 'up', value),
				i: (value) => this.engine.setInput('p2', 'up', value),
				k: (value) => this.engine.setInput('p2', 'down', value),
				l: (value) => this.engine.setInput('p2', 'down', value),
				j: (value) => this.engine.setInput('p2', 'up', value),
			}

			document.addEventListener('keydown', (event) => {
				keyHandlers[event.key]?.(true)
			})

			document.addEventListener('keyup', (event) => {
				keyHandlers[event.key]?.(false)
			})

			// TODO: remove event listeners ?
		}

		disconnectedCallback() {
			// TODO: is renderer stop needed
			// this.renderer.stop()
			this.engine.stop()
		}
	},
)
