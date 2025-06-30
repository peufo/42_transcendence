import {
	Engine,
	type State,
	ARENA_WIDTH,
	ARENA_HEIGHT,
	TICK_INTERVAL,
} from '../../lib/engine/index.js'

function lerp(a, b, t) {
	return a + (b - a) * t
}

customElements.define(
	'ft-pong-local-test',
	class extends HTMLElement {
		canvas: HTMLCanvasElement
		ctx: CanvasRenderingContext2D
		engine: Engine

		constructor() {
			super()
			this.classList.add('grid', 'place-items-center')
			this.canvas = document.createElement('canvas')
			this.canvas.setAttribute('width', ARENA_WIDTH.toString())
			this.canvas.setAttribute('height', ARENA_HEIGHT.toString())
			this.canvas.classList.add('border')
			this.appendChild(this.canvas)
			const ctx = this.canvas.getContext('2d')
			if (!ctx) throw new Error('Canvas context failed')
			this.ctx = ctx
			this.ctx.textAlign = 'center'
			this.engine = new Engine(this.updateStates.bind(this))
			this.engine.startGame()
			requestAnimationFrame(this.render.bind(this))
		}

		connectedCallback() {
			const keyHandlers: Record<string, (value: boolean) => void> = {
				w: (value) => this.engine.setInput('p1', 'up', value),
				s: (value) => this.engine.setInput('p1', 'down', value),
				i: (value) => this.engine.setInput('p2', 'up', value),
				k: (value) => this.engine.setInput('p2', 'down', value),
			}

			document.addEventListener('keydown', (event) => {
				keyHandlers[event.key]?.(true)
			})

			document.addEventListener('keyup', (event) => {
				keyHandlers[event.key]?.(false)
			})
		}

		previousState: State
		currentState: State
		renderState: State
		lastUpdateTime: number

		updateStates(newState: State) {
			this.previousState = this.currentState
			this.currentState = newState
			if (!this.renderState) this.renderState = newState
			this.lastUpdateTime = Date.now()
		}

		interpolate(t: number): boolean {
			if (!this.previousState || !this.currentState) return false
			this.renderState.ball.position.x = lerp(
				this.previousState.ball.position.x,
				this.currentState.ball.position.x,
				t,
			)
			this.renderState.ball.position.y = lerp(
				this.previousState.ball.position.y,
				this.currentState.ball.position.y,
				t,
			)
			this.renderState.paddles.p1.position.x = lerp(
				this.previousState.paddles.p1.position.x,
				this.currentState.paddles.p1.position.x,
				t,
			)
			this.renderState.paddles.p1.position.y = lerp(
				this.previousState.paddles.p1.position.y,
				this.currentState.paddles.p1.position.y,
				t,
			)
			this.renderState.paddles.p2.position.x = lerp(
				this.previousState.paddles.p2.position.x,
				this.currentState.paddles.p2.position.x,
				t,
			)
			this.renderState.paddles.p2.position.y = lerp(
				this.previousState.paddles.p2.position.y,
				this.currentState.paddles.p2.position.y,
				t,
			)
			return true
		}

		render() {
			const timeSinceLastUpdate = Date.now() - this.lastUpdateTime
			const t = Math.min(1, timeSinceLastUpdate / TICK_INTERVAL)
			if (this.interpolate(t)) {
				this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

				// ball
				this.ctx.beginPath()
				this.ctx.rect(
					this.renderState.ball.position.x,
					this.renderState.ball.position.y,
					this.renderState.ball.size,
					this.renderState.ball.size,
				)
				this.ctx.fill()

				// // paddle
				this.ctx.beginPath()
				this.ctx.rect(
					this.renderState.paddles.p1.position.x,
					this.renderState.paddles.p1.position.y,
					this.renderState.paddles.p1.width,
					this.renderState.paddles.p1.height,
				)
				this.ctx.fill()
				this.ctx.beginPath()
				this.ctx.rect(
					this.renderState.paddles.p2.position.x,
					this.renderState.paddles.p2.position.y,
					this.renderState.paddles.p2.width,
					this.renderState.paddles.p2.height,
				)
				this.ctx.fill()

				const str = `Player 1: ${this.renderState.scores.p1} | Player 2: ${this.renderState.scores.p2}`
				this.ctx.fillText(str, ARENA_WIDTH / 2, 10)
			}
			requestAnimationFrame(this.render.bind(this))
		}
	},
)
