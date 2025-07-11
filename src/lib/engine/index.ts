import { Ball } from './Ball.js'
import { Paddle } from './Paddle.js'
import { Vector2 } from './Vector2.js'

// types
export type Player = 'p1' | 'p2'
export type Move = 'down' | 'up'
type Paddles = Record<Player, Paddle>
type Inputs = Record<Player, Record<Move, boolean>>
export type Scores = Record<Player, number>
export enum EVENT_TYPE {
	TICK = 0,
	SCORE = 1,
}
export type EngineEventData = {
	[EVENT_TYPE.TICK]?: State
	[EVENT_TYPE.SCORE]?: Scores
}
type EngineOption = {
	onEvent?: (event: EngineEventData) => void
	onTick?: (state: State) => void
	onScore?: (scores: Scores) => void
}
export type State = {
	b: { x: number; y: number }
	p1: number
	p2: number
}

// Game properties
const TICK_RATE = 20
export const BALL_SUBSTEPS = 3
export const TICK_INTERVAL = 1000 / TICK_RATE
export const ARENA_WIDTH = 1000
export const ARENA_HEIGHT = 700
const rules = {
	scoreToWin: 3,
}

// Ball properties
export const BALL_MAX_BOUNCE_ANGLE = (4 * Math.PI) / 12 // <- 60 degrees in radians
export const BALL_BASE_SPEED = 0.2
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
	#options: EngineOption

	#roundStartTime: number
	#paddles: Paddles
	#ball: Ball
	#inputs: Inputs
	#scores: Scores = {
		p1: 0,
		p2: 0,
	}
	#gameOver: boolean

	get paddles() {
		return this.#paddles
	}

	get roundStartTime() {
		return this.#roundStartTime
	}

	constructor(options: EngineOption = {}) {
		this.#options = options
	}

	#timer(seconds: number, timeoutCallback: () => void) {
		console.log(seconds) // event ?
		setTimeout(() => {
			if (seconds > 1) this.#timer(seconds - 1, timeoutCallback)
			else timeoutCallback()
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
		const scorer = this.#ball.update()
		if (scorer) {
			this.#endRound()
			this.#scores[scorer]++
			this.#onEvent(EVENT_TYPE.SCORE, this.#scores)
			if (this.#scores[scorer] >= rules.scoreToWin)
				console.log(`${scorer} won the game !`) // event
			else this.#newRound()
		}
	}

	#tickLoop() {
		const tickStart = Date.now()
		this.#updateState()
		this.#onEvent(EVENT_TYPE.TICK, {
			b: { x: this.#ball.position.x, y: this.#ball.position.y },
			p1: this.paddles.p1.position.y,
			p2: this.paddles.p2.position.y,
		})
		const processTime = Date.now() - tickStart
		const delay = Math.max(0, TICK_INTERVAL - processTime)
		if (!this.#gameOver) setTimeout(this.#tickLoop.bind(this), delay)
	}

	#onEvent<T extends EVENT_TYPE>(eventType: T, data: EngineEventData[T]) {
		this.#options.onEvent?.({ [eventType]: data })
		if (eventType === EVENT_TYPE.TICK) {
			this.#options.onTick?.(data as State)
		}
		if (eventType === EVENT_TYPE.SCORE) {
			this.#options.onScore?.(data as Scores)
		}
	}

	#endRound() {
		this.#gameOver = true
	}

	#newRound() {
		this.#initState()
		this.#timer(1, () => {
			this.#gameOver = false
			this.#roundStartTime = Date.now()
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
