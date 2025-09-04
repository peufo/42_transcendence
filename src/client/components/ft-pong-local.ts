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
import { toast } from './ft-toast.js'

customElements.define(
	'ft-pong-local',
	class extends HTMLElement {
		player1Name: string | null
		player2Name: string | null
		animationFrameId = 0
		canvas: HTMLCanvasElement
		header: HTMLElement
		ctx: CanvasRenderingContext2D
		engine: Engine
		frameId: number
		interpolate = useInterpolate()
		scores: Scores = {
			p1: 0,
			p2: 0,
		}

		connectedCallback() {
			const urlParams = new URLSearchParams(window.location.search)
			this.player1Name = urlParams.get('player1')
			this.player2Name = urlParams.get('player2')
			const scoreToWin = urlParams.get('scoreToWin')
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
				scoreToWin: Number(scoreToWin),
				onTimerTick: (data) => {
					if (data === 0) {
						this.animationFrameId = requestAnimationFrame(
							this.renderFrame.bind(this),
						)
					} else {
						this.renderTimer(data)
						cancelAnimationFrame(this.animationFrameId)
					}
				},
				onTick: (data) => {
					this.interpolate.updateState(data)
				},
				onRoundEnd: (data) => {
					this.scores = data.scores
				},
				onGameEnd: (data) => {
					this.scores = data.finalRound.scores
					toast.success('Game end')
				},
			})
			this.engine.start()

			this.frameId = requestAnimationFrame(this.renderFrame.bind(this))
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

		disconnectedCallback() {
			cancelAnimationFrame(this.frameId)
			this.engine.stop()
		}

		renderTimer(timer: number) {
			this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
			const fontSize = 50
			this.ctx.font = `${fontSize}px sans-serif`
			this.ctx.fillText(
				timer.toString(),
				ARENA_WIDTH / 2 + fontSize / 2,
				ARENA_HEIGHT / 2,
			)
		}

		renderFrame() {
			this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
			const state = this.interpolate.getState()
			// ball
			this.ctx.beginPath()
			this.ctx.rect(state.b.x, state.b.y, BALL_BASE_SIZE, BALL_BASE_SIZE)
			this.ctx.fill()

			// paddle
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

			// scores
			const fontSize = 40
			this.ctx.font = `${fontSize}px sans-serif`
			this.ctx.fillStyle = '#7f22fe'
			this.ctx.fillText(
				`${this.player1Name} : ${this.scores.p1}`,
				ARENA_WIDTH / 2 - ARENA_WIDTH / 4,
				fontSize,
			)
			this.ctx.fillStyle = '#7f22fe'
			this.ctx.fillText(
				`${this.player2Name} : ${this.scores.p2}`,
				ARENA_WIDTH / 2 + ARENA_WIDTH / 4,
				fontSize,
			)
			this.ctx.fillStyle = 'black'
			this.animationFrameId = requestAnimationFrame(this.renderFrame.bind(this))
		}
	},
)
