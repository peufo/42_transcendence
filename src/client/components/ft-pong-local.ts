import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	BALL_BASE_SIZE,
	Engine,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type Scores,
} from '../../lib/engine/index.js'
import { useInterpolate } from '../../lib/interpolate.js'

customElements.define(
	'ft-pong-local',
	class extends HTMLElement {
		canvas: HTMLCanvasElement
		ctx: CanvasRenderingContext2D
		engine: Engine
		frameId: number
		interpolate = useInterpolate()
		scores: Scores = {
			p1: 0,
			p2: 0,
		}

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
			this.engine = new Engine({
				onTick: this.interpolate.updateState,
				onScore: (scores) => {
					this.scores = scores
				},
			})
			this.engine.start()
			this.frameId = requestAnimationFrame(this.render.bind(this))
		}

		disconnectedCallback() {
			cancelAnimationFrame(this.frameId)
			this.engine.stop()
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

		render() {
			const state = this.interpolate.getState()
			this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

			// ball
			this.ctx.beginPath()
			this.ctx.rect(state.b.x, state.b.y, BALL_BASE_SIZE, BALL_BASE_SIZE)
			this.ctx.fill()

			// // paddle
			this.ctx.beginPath()
			this.ctx.rect(
				PADDLE_BASE_P1_POSITION.x,
				state.p1,
				PADDLE_BASE_WIDTH,
				PADDLE_BASE_HEIGHT,
			)
			this.ctx.fill()
			this.ctx.beginPath()
			this.ctx.rect(
				PADDLE_BASE_P2_POSITION.x,
				state.p2,
				PADDLE_BASE_WIDTH,
				PADDLE_BASE_HEIGHT,
			)
			this.ctx.fill()

			const fontSize = 40
			this.ctx.font = `${fontSize}px sans-serif`
			this.ctx.fillText(
				`${this.scores.p1}`,
				ARENA_WIDTH / 2 - ARENA_WIDTH / 4,
				fontSize,
			)
			this.ctx.fillText(
				`${this.scores.p2}`,
				ARENA_WIDTH / 2 + ARENA_WIDTH / 4,
				fontSize,
			)
			this.frameId = requestAnimationFrame(this.render.bind(this))
		}
	},
)
