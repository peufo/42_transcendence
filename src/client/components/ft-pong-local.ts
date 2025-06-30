import {
	Engine,
	type State,
	ARENA_WIDTH,
	ARENA_HEIGHT,
} from '../../lib/engine/index.js'

customElements.define(
	'ft-pong-local',
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
			this.engine = new Engine(this.render.bind(this))
			this.engine.startGame()
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

		render({ ball, paddles: { p1, p2 }, scores }: State) {
			// rendering
			this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

			// ball
			this.ctx.beginPath()
			this.ctx.rect(ball.position.x, ball.position.y, ball.size, ball.size)
			this.ctx.fill()

			// // paddle
			this.ctx.beginPath()
			this.ctx.rect(p1.position.x, p1.position.y, p1.width, p1.height)
			this.ctx.fill()
			this.ctx.beginPath()
			this.ctx.rect(p2.position.x, p2.position.y, p2.width, p2.height)
			this.ctx.fill()

			const str = `Player 1: ${scores.p1} | Player 2: ${scores.p2}`
			this.ctx.fillText(str, ARENA_WIDTH / 2, 10)
		}
	},
)
