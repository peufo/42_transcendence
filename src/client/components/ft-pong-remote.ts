import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	BALL_BASE_SIZE,
	type Move,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type Player,
	type Scores,
} from '../../lib/engine/index.js'
import { useInterpolate } from '../../lib/interpolate.js'
import { type OpenedChannel, openChannel } from '../../lib/socketChannels.js'
import { type CleanEffect, createEffect } from '../utils/signal.js'
import { $match, $user } from '../utils/store.js'
import { toast } from './ft-toast.js'

customElements.define(
	'ft-pong-remote',
	class extends HTMLElement {
		animationFrameId = 0
		canvas: HTMLCanvasElement
		ctx: CanvasRenderingContext2D
		channel: OpenedChannel<'matches'>
		interpolate = useInterpolate()
		scores: Scores = {
			p1: 0,
			p2: 0,
		}
		private user = $user.get()
		private cleanEffect: CleanEffect

		initCanvas() {
			if (!this.canvas) {
				this.canvas = document.createElement('canvas')
				this.canvas.setAttribute('width', ARENA_WIDTH.toString())
				this.canvas.setAttribute('height', ARENA_HEIGHT.toString())
				this.canvas.classList.add('border')
				this.appendChild(this.canvas)
				const ctx = this.canvas.getContext('2d')
				if (!ctx) throw new Error('Canvas context failed')
				this.ctx = ctx
				this.ctx.textAlign = 'center'
			}
			this.renderWaitingFrame()
		}

		disconnectedCallback() {
			this.channel?.close()
			this.cleanEffect()
		}

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.handle()
			})
		}

		handle() {
			this.classList.add('flex', 'justify-center')
			const match = $match.get()

			if (!this.user) {
				this.innerHTML = /*html*/ `
					No user found
					`
				return
			}
			if (!match) {
				this.innerHTML = /*html*/ `
					<div class="h-[100%] w-[100%] flex flex-row items-center justify-center">
						You don't have any match, you idiot.
					</div>
					` //TODO: Remove above
				return
			}
			console.log('RENDER PONG REMOTE', match.id)
			this.initCanvas() // TODO: use babylon
			this.channel = openChannel(
				'matches',
				{ matchId: match.id.toString() },
				{
					onEngineEvent: (data) => {
						if (data.onTimerTick !== undefined) {
							if (data.onTimerTick === 0) {
								this.animationFrameId = requestAnimationFrame(
									this.renderFrame.bind(this),
								)
							} else {
								this.renderTimer(data.onTimerTick)
								cancelAnimationFrame(this.animationFrameId)
							}
						}
						if (data.onTick) {
							this.interpolate.updateState(data.onTick)
						}
						if (data.onRoundEnd) {
							this.scores = data.onRoundEnd.scores
						}
						if (data.onGameEnd) {
							this.scores = data.onGameEnd.finalRound.scores
							toast.success('Game end')
						}
					},
					onSurrender: (_data) => {
						toast.success('TODO: handle surrender')
					},
				},
			)

			const player: Player = this.user.id === match.player1Id ? 'p1' : 'p2'

			const setInput = (move: Move, value: boolean) => {
				this.channel.emit('onPlayerInput', { player, move, value })
			}

			const keyHandlers: Record<string, (value: boolean) => void> = {
				w: (value) => setInput('up', value),
				s: (value) => setInput('down', value),
				ArrowUp: (value) => setInput('up', value),
				ArrowDown: (value) => setInput('down', value),
				a: (value) => setInput('up', value),
				d: (value) => setInput('down', value),
				ArrowLeft: (value) => setInput('up', value),
				ArrowRight: (value) => setInput('down', value),
			}

			document.addEventListener('keydown', (event) => {
				keyHandlers[event.key]?.(true)
			})

			document.addEventListener('keyup', (event) => {
				keyHandlers[event.key]?.(false)
			})
		}

		renderWaitingFrame() {
			this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
			const fontSize = 50
			this.ctx.font = `${fontSize}px sans-serif`
			this.ctx.fillText(
				'Waiting on player',
				ARENA_WIDTH / 2 + fontSize / 2,
				ARENA_HEIGHT / 2,
			)
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
			this.animationFrameId = requestAnimationFrame(this.renderFrame.bind(this))
		}
	},
)
