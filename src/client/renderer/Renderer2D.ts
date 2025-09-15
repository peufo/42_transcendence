import { cubicOut } from '../../lib/easing.js'
import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	BALL_BASE_SIZE,
	type Collision,
	type GameOverData,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type Player,
	type RoundData,
	type State,
} from '../../lib/engine/index.js'
import { getRandomArbitrary } from '../../lib/utils.js'
import { Renderer } from './Renderer.js'

const POK_DURATION = 750

type Pok = {
	x: number
	y: number
	text: string
	maxSize: number
	maxOpacity: number
	color: string
	lifetime: number
}
const pokNoises: string[] = ['POK', 'PAK', 'PIK', 'PUK', 'PEK']
const pokColors: string[] = [
	'rgba(63, 167, 214, 1)',
	'rgba(246, 215, 67, 1)',
	'rgba(244, 91, 105, 1)',
	'rgba(155, 93, 229, 1)',
	'rgba(0, 187, 249, 1)',
	'rgba(254, 228, 64, 1)',
	'rgba(0, 245, 212, 1)',
	'rgba(251, 86, 7, 1)',
	'rgba(131, 56, 236, 1)',
	'rgba(255, 0, 110, 1)',
]

export class Renderer2D extends Renderer {
	private animationFrameId = 0
	private poks: Pok[] = []
	private ctx: CanvasRenderingContext2D
	private lastFrameTime = 0

	constructor(element: HTMLElement, names: Record<Player, string>) {
		super(element, names)
		const newCtx = this.canvas.getContext('2d')
		if (!newCtx) throw new Error('Canvas context failed')
		this.ctx = newCtx
		this.ctx.textAlign = 'center'
		this.renderWaitingFrame()
	}

	private renderWaitingFrame = () => {
		this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
		const fontSize = 50
		this.ctx.font = `${fontSize}px sans-serif`
		this.ctx.fillText(
			'Waiting for game to start',
			ARENA_WIDTH / 2 + fontSize / 2,
			ARENA_HEIGHT / 2 - fontSize,
		)
	}

	private renderGameOver = () => {
		this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
		const fontSize = 50
		this.ctx.font = `${fontSize}px sans-serif`
		this.ctx.fillText(
			'GAME OVER',
			ARENA_WIDTH / 2 + fontSize / 2,
			ARENA_HEIGHT / 2 - fontSize * 2,
		)
		const winner =
			this.scores.p1 > this.scores.p2
				? this.playerNames.p1
				: this.playerNames.p2
		this.ctx.fillText(
			`${winner} won !`,
			ARENA_WIDTH / 2 + fontSize / 2,
			ARENA_HEIGHT / 2 + fontSize * 2,
		)
	}

	private renderTimer = (timer: number) => {
		this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
		const fontSize = 50
		this.ctx.font = `${fontSize}px sans-serif`
		this.ctx.fillText(
			timer.toString(),
			ARENA_WIDTH / 2 + fontSize / 2,
			ARENA_HEIGHT / 2,
		)
	}

	private renderFrame = () => {
		const timeSinceLastFrame = Date.now() - this.lastFrameTime

		this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
		const state = this.interpolate.getState()
		// ball
		this.ctx.beginPath()
		this.ctx.rect(state.b.x, state.b.y, BALL_BASE_SIZE, BALL_BASE_SIZE)
		this.ctx.fill()

		// paddle
		this.ctx.beginPath()
		this.ctx.fillStyle =
			this.user?.name === this.playerNames.p1 ? '#7f22fe' : '#fe9a00ff'
		this.ctx.rect(
			PADDLE_BASE_P1_POSITION.x,
			state.p1,
			PADDLE_BASE_WIDTH,
			PADDLE_BASE_HEIGHT,
		)
		this.ctx.fill()
		this.ctx.beginPath()
		this.ctx.fillStyle =
			this.user?.name === this.playerNames.p2 ? '#7f22fe' : '#fe9a00'
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
		this.ctx.fillStyle = 'black'
		this.ctx.fillText(
			`${this.playerNames.p1}        ${this.scores.p1} : ${this.scores.p2}        ${this.playerNames.p2}`,
			ARENA_WIDTH / 2,
			fontSize,
		)

		// poks
		this.poks.forEach((pok) => {
			const opacity =
				pok.maxOpacity - pok.maxOpacity * cubicOut(pok.lifetime / POK_DURATION)
			this.ctx.fillStyle = pok.color.replace(/1\)$/, `${opacity})`)
			const size = pok.maxSize * cubicOut(pok.lifetime / POK_DURATION)
			this.ctx.font = `${size}px sans-serif`
			this.ctx.fillText(pok.text, pok.x, pok.y + fontSize / 2)
			pok.lifetime += timeSinceLastFrame
		})
		this.ctx.fillStyle = 'black'

		this.lastFrameTime = Date.now()
		this.animationFrameId = requestAnimationFrame(this.renderFrame)
	}

	clear(): void {
		this.canvas.remove()
	}

	onTick(data: State) {
		super.onTick(data)
	}
	onRoundEnd(data: RoundData) {
		super.onRoundEnd(data)
	}
	onGameEnd(data: GameOverData) {
		super.onGameEnd(data)
		cancelAnimationFrame(this.animationFrameId)
		this.renderGameOver()
	}
	onCollision(data: Collision) {
		const obj: Pok = {
			...data,
			text: pokNoises[Math.floor(Math.random() * pokNoises.length)],
			color: pokColors[Math.floor(Math.random() * pokColors.length)],
			maxOpacity: 5,
			maxSize: getRandomArbitrary(40, 70),
			lifetime: 0,
		}
		this.poks.push(obj)
		setTimeout(() => {
			this.poks.shift()
		}, POK_DURATION)
	}
	onTimerTick(data: number) {
		if (data === 0) {
			this.animationFrameId = requestAnimationFrame(this.renderFrame)
		} else {
			this.renderTimer(data)
			cancelAnimationFrame(this.animationFrameId)
		}
	}
	onEngineStart() {
		this.animationFrameId = requestAnimationFrame(this.renderFrame)
	}
}
