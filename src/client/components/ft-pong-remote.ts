import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	BALL_BASE_SIZE,
	type EngineEventData,
	EVENT_TYPE,
	type Move,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type Player,
	type Scores,
} from '../../lib/engine/index.js'
import { useInterpolate } from '../../lib/interpolate.js'

customElements.define(
	'ft-pong-remote',
	class extends HTMLElement {
		canvas: HTMLCanvasElement
		ctx: CanvasRenderingContext2D
		socket: WebSocket
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
			this.socket = new WebSocket(`ws://${document.location.host}/ws`)
			this.socket.addEventListener('message', (event) => {
				const data: EngineEventData = JSON.parse(event.data)
				const newState = data[EVENT_TYPE.TICK]
				const newScores = data[EVENT_TYPE.SCORE]
				if (newState) {
					this.interpolate.updateState(newState)
				}
				if (newScores) {
					this.scores = newScores
				}
			})
			requestAnimationFrame(this.render.bind(this))
		}

		disconnectedCallback() {
			this.socket.close()
		}

		connectedCallback() {
			const setInput = (player: Player, move: Move, value: boolean) => {
				this.socket.send(JSON.stringify({ player, move, value }))
			}

			const keyHandlers: Record<string, (value: boolean) => void> = {
				w: (value) => setInput('p1', 'up', value),
				s: (value) => setInput('p1', 'down', value),
				i: (value) => setInput('p2', 'up', value),
				k: (value) => setInput('p2', 'down', value),
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

			const str = `Player 1: ${this.scores.p1} | Player 2: ${this.scores.p2}`
			this.ctx.fillText(str, ARENA_WIDTH / 2, 10)
			requestAnimationFrame(this.render.bind(this))
		}
	},
)
