import { Ball } from './Ball.js'
import { Paddle } from './Paddle.js'
import { Vector2 } from './Vector2.js'

// types
export type Player = 'p1' | 'p2'
export type Move = 'down' | 'up'
type Paddles = Record<Player, Paddle>
type Inputs = Record<Player, Record<Move, boolean>>
export type Scores = Record<Player, number>
export type RoundData = {
	scorer: Player
	scores: Scores
	rallyCount: number
	ballPositionY: number
}
type GameOverData = {
	finishedAt: number
}
export type State = {
	b: { x: number; y: number }
	p1: number
	p2: number
}
export type Collision = {
	type: COLLISION_TYPE
	x: number
	y: number
}

export enum COLLISION_TYPE {
	WALL_TOP = 'wall_top',
	WALL_BOTTOM = 'wall_bottom',
	PADDLE_P1 = 'paddle_p1',
	PADDLE_P2 = 'paddle_p2',
}

export type EngineEventData = {
	onTick?: State
	onRoundEnd?: RoundData
	onGameEnd?: GameOverData
	onCollision?: Collision
	onTimerTick?: number
}

type EngineOptions = {
	scoreToWin: number
	onEvent?: (event: EngineEventData) => void
} & {
	[EventName in keyof EngineEventData]: (
		data: Required<EngineEventData>[EventName],
	) => void
}

// Game properties
const TICK_RATE = 30
export const BALL_SUBSTEPS = 3
export const TICK_INTERVAL = 1000 / TICK_RATE
export const ARENA_WIDTH = 1000
export const ARENA_HEIGHT = 700

// Ball properties
export const BALL_MAX_BOUNCE_ANGLE = (4 * Math.PI) / 12 // <- 60 degrees in radians
export const BALL_BASE_SPEED = 0.3
export const BALL_MAX_SPEED = 0.7
export const BALL_TIME_TO_REACH_MAX_SPEED = 50000
export const BALL_BASE_SIZE = ARENA_WIDTH / 70
export const BALL_BASE_POSITION = new Vector2(
	ARENA_WIDTH / 2 - BALL_BASE_SIZE / 2,
	ARENA_HEIGHT / 2 - BALL_BASE_SIZE / 2,
)

// Paddle properties
export const PADDLE_BASE_SPEED = 0.55
export const PADDLE_BASE_HEIGHT = ARENA_HEIGHT / 5
export const PADDLE_BASE_WIDTH = BALL_BASE_SIZE
const PADDLE_OFFSET_FROM_WALL = PADDLE_BASE_WIDTH * 4
export const PADDLE_BASE_P1_POSITION = new Vector2(
	PADDLE_OFFSET_FROM_WALL,
	ARENA_HEIGHT / 2 - PADDLE_BASE_HEIGHT / 2,
)
export const PADDLE_BASE_P2_POSITION = new Vector2(
	ARENA_WIDTH - PADDLE_BASE_WIDTH - PADDLE_OFFSET_FROM_WALL,
	ARENA_HEIGHT / 2 - PADDLE_BASE_HEIGHT / 2,
)

export class Engine {
	#options: EngineOptions
	#roundStartTime: number
	#paddles: Paddles
	#ball: Ball
	#inputs: Inputs
	#scores: Scores = {
		p1: 0,
		p2: 0,
	}
	#gameOver: boolean = false
	#roundOver: boolean = false
	tickData: EngineEventData = {}

	get paddles() {
		return this.#paddles
	}

	get roundStartTime() {
		return this.#roundStartTime
	}

	constructor(options: EngineOptions) {
		this.#options = options
	}

	#timer(seconds: number, timeoutCallback: () => void) {
		this.onEvent({ onTimerTick: seconds })
		setTimeout(() => {
			if (!this.#gameOver) {
				if (seconds > 1) this.#timer(seconds - 1, timeoutCallback)
				else timeoutCallback()
			}
		}, 1000)
	}

	#initState() {
		this.#paddles = {
			p1: new Paddle(PADDLE_BASE_P1_POSITION),
			p2: new Paddle(PADDLE_BASE_P2_POSITION),
		}
		this.#ball = new Ball(BALL_BASE_POSITION, this)
		this.#inputs = {
			p1: { down: false, up: false },
			p2: { down: false, up: false },
		}
	}

	#updateState() {
		if (this.#inputs.p1.up) this.#paddles.p1.move('up')
		if (this.#inputs.p1.down) this.#paddles.p1.move('down')
		if (this.#inputs.p2.up) this.#paddles.p2.move('up')
		if (this.#inputs.p2.down) this.#paddles.p2.move('down')
		const roundInfo = this.#ball.update()
		if (roundInfo) this.#endRound(roundInfo)
	}

	#tickLoop() {
		const tickStart = Date.now()
		this.tickData = {}
		this.#updateState()
		this.tickData.onTick = {
			b: { x: this.#ball.position.x, y: this.#ball.position.y },
			p1: this.paddles.p1.position.y,
			p2: this.paddles.p2.position.y,
		}
		this.onEvent(this.tickData)
		if (!this.#gameOver && !this.#roundOver) {
			const processTime = Date.now() - tickStart
			const delay = Math.max(0, TICK_INTERVAL - processTime)
			setTimeout(this.#tickLoop.bind(this), delay)
		}
	}

	onEvent(data: EngineEventData) {
		this.#options.onEvent?.(data)
		for (const [eventName, eventData] of Object.entries(data)) {
			// @ts-ignore
			this.#options[eventName]?.(eventData)
		}
	}

	#endRound(roundInfo: RoundData) {
		this.#roundOver = true
		const { scorer } = roundInfo
		this.#scores[scorer]++
		roundInfo.scores = this.#scores
		this.tickData.onRoundEnd = roundInfo
		if (this.#scores[scorer] >= this.#options.scoreToWin) {
			this.#gameOver = true
			this.tickData.onGameEnd = { finishedAt: Date.now() }
		} else this.#newRound()
	}

	#newRound() {
		this.#initState()
		this.#timer(1, () => {
			this.#roundStartTime = Date.now()
			this.#roundOver = false
			this.#tickLoop()
		})
	}

	setInput(player: Player, move: Move, value: boolean) {
		this.#inputs[player][move] = value
	}

	start() {
		this.#newRound()
	}

	stop() {
		this.#gameOver = true
	}
}
