import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	BALL_BASE_SIZE,
	type Collision,
	type EngineOptionsEvents,
	type GameOverData,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type Player,
	type RoundData,
	type Scores,
	type State,
} from '../../lib/engine/index.js'
import { useInterpolate } from '../../lib/interpolate.js'
import { $user } from '../utils/store.js'

type Pok = { x: number; y: number; text: string; size: number; color: string }
const pokNoises: string[] = ['POK', 'PAK', 'PIK', 'PUK', 'PEK']
const pokColors: string[] = [
	'#3FA7D6',
	'#F6D743',
	'#F45B69',
	'#9B5DE5',
	'#00BBF9',
	'#FEE440',
	'#00F5D4',
	'#FB5607',
	'#8338EC',
	'#FF006E',
]

export abstract class Renderer implements EngineOptionsEvents {
	protected element: HTMLElement
	protected user = $user.get(false)
	protected interpolate = useInterpolate()
	protected scores: Scores = {
		p1: 0,
		p2: 0,
	}
	protected playerNames = {
		p1: 'Player 1',
		p2: 'Player 2',
	}

	constructor(element: HTMLElement) {
		this.element = element
	}

	setPlayerNames(names: Record<Player, string | undefined>) {
		if (names.p1) this.playerNames.p1 = names.p1
		if (names.p2) this.playerNames.p2 = names.p2
	}

	abstract onTick(data: State): void
	abstract onRoundEnd(data: RoundData): void
	abstract onGameEnd(data: GameOverData): void
	abstract onCollision(data: Collision): void
	abstract onTimerTick(data: number): void
	abstract onEngineStart(): void
}

export class Renderer2D extends Renderer {
	private animationFrameId = 0
	private poks: Pok[] = []
	private ctx: CanvasRenderingContext2D

	constructor(element: HTMLElement) {
		super(element)
		const canvas: HTMLCanvasElement = document.createElement('canvas')
		canvas.setAttribute('width', ARENA_WIDTH.toString())
		canvas.setAttribute('height', ARENA_HEIGHT.toString())
		canvas.classList.add('border')
		this.element.appendChild(canvas)
		const newCtx = canvas.getContext('2d')
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
		this.ctx.fillStyle =
			this.user?.name === this.playerNames.p1 ? '#7f22fe' : '#ff2056'
		this.ctx.fillText(
			`${this.playerNames.p1} : ${this.scores.p1}`,
			ARENA_WIDTH / 2 - ARENA_WIDTH / 4,
			fontSize,
		)
		this.ctx.fillStyle =
			this.user?.name === this.playerNames.p2 ? '#7f22fe' : '#ff2056'
		this.ctx.fillText(
			`${this.playerNames.p2} : ${this.scores.p2}`,
			ARENA_WIDTH / 2 + ARENA_WIDTH / 4,
			fontSize,
		)
		this.ctx.fillStyle = 'black'

		// poks
		this.poks.forEach((pok) => {
			this.ctx.fillStyle = pok.color
			this.ctx.font = `${pok.size}px sans-serif`
			this.ctx.fillText(pok.text, pok.x, pok.y + fontSize / 2)
		})
		this.ctx.fillStyle = 'black'

		this.animationFrameId = requestAnimationFrame(this.renderFrame)
	}

	onTick(data: State) {
		this.interpolate.updateState(data)
	}
	onRoundEnd(data: RoundData) {
		this.scores = data.scores
	}
	onGameEnd(data: GameOverData) {
		this.scores = data.finalRound.scores
		cancelAnimationFrame(this.animationFrameId)
		this.renderGameOver()
	}
	onCollision(data: Collision) {
		const obj: Pok = {
			...data,
			text: pokNoises[Math.floor(Math.random() * pokNoises.length)],
			color: pokColors[Math.floor(Math.random() * pokColors.length)],
			size: Math.floor(Math.random() * (60 - 30 + 1) + 30),
		}
		this.poks.push(obj)
		setTimeout(() => {
			this.poks.shift()
		}, 1500)
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
