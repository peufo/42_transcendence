import { Paddle } from './Paddle.js'
import { Ball } from './Ball.js'
import { Vector2 } from './Vector2.js'
// import { Bot } from './Ai.js'

// types
export type Player = 'p1' | 'p2'
export type Move = 'down' | 'up'
type Paddles = Record<Player, Paddle>
type Inputs = Record<Player, Record<Move, boolean>>
type Scores = Record<Player, number>
export type State = {
	ball: Ball
	paddles: Paddles
	scores: Scores
}

// Game properties
const TICK_RATE = 30
export const BALL_SUBSTEPS = 3
export const TICK_INTERVAL = 1000 / TICK_RATE
export const ARENA_WIDTH = 1000
export const ARENA_HEIGHT = 700

// Ball properties
export const BALL_MAX_BOUNCE_ANGLE = (4 * Math.PI) / 12 // <- 60 degrees in radians
export const BALL_BASE_SPEED = 0.35
export const BALL_MAX_SPEED = 1.2
export const BALL_TIME_TO_REACH_MAX_SPEED = 50000
const BALL_BASE_SIZE = ARENA_WIDTH / 70
const BALL_BASE_POSITION = new Vector2(
	ARENA_WIDTH / 2 - BALL_BASE_SIZE / 2,
	ARENA_HEIGHT / 2 - BALL_BASE_SIZE / 2,
)

// Paddle properties
export const PADDLE_BASE_SPEED = 0.55
const PADDLE_BASE_HEIGHT = ARENA_HEIGHT / 5
const PADDLE_BASE_WIDTH = BALL_BASE_SIZE
const PADDLE_OFFSET_FROM_WALL = PADDLE_BASE_WIDTH * 4
const PADDLE_BASE_P1_POSITION = new Vector2(
	PADDLE_OFFSET_FROM_WALL,
	ARENA_HEIGHT / 2 - PADDLE_BASE_HEIGHT / 2,
)
const PADDLE_BASE_P2_POSITION = new Vector2(
	ARENA_WIDTH - PADDLE_BASE_WIDTH - PADDLE_OFFSET_FROM_WALL,
	ARENA_HEIGHT / 2 - PADDLE_BASE_HEIGHT / 2,
)

export class Engine {
	#startTime: number
	#tickCallback: (state: State) => void
	#paddles: Paddles = {
		p1: new Paddle(
			PADDLE_BASE_P1_POSITION,
			PADDLE_BASE_WIDTH,
			PADDLE_BASE_HEIGHT,
		),
		p2: new Paddle(
			PADDLE_BASE_P2_POSITION,
			PADDLE_BASE_WIDTH,
			PADDLE_BASE_HEIGHT,
		),
	}
	#ball: Ball = new Ball(BALL_BASE_POSITION, BALL_BASE_SIZE, this)
	#scores: Scores = {
		p1: 0,
		p2: 0,
	}
	#inputs: Inputs = {
		p1: { down: false, up: false },
		p2: { down: false, up: false },
	}
	gameOver = false

	// #bot = new Bot('p2', this) // test

	get paddles() {
		return this.#paddles
	}

	get startTime() {
		return this.#startTime
	}

	constructor(tickCallback: (state: State) => void) {
		this.#tickCallback = tickCallback
	}

	#resetState() {
		this.#startTime = Date.now()
		this.#paddles.p1 = new Paddle(
			PADDLE_BASE_P1_POSITION,
			PADDLE_BASE_WIDTH,
			PADDLE_BASE_HEIGHT,
		)
		this.#paddles.p2 = new Paddle(
			PADDLE_BASE_P2_POSITION,
			PADDLE_BASE_WIDTH,
			PADDLE_BASE_HEIGHT,
		)
		this.#ball = new Ball(BALL_BASE_POSITION, BALL_BASE_SIZE, this)
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
		this.#ball.update()
		const scorer = this.#ball.playerScoring()
		if (scorer) {
			this.#scores[scorer]++
			this.#resetState()
		}
	}

	#loop() {
		const tickStart = Date.now()
		this.#updateState()
		this.#tickCallback({
			ball: this.#ball,
			paddles: this.#paddles,
			scores: this.#scores,
		})
		// this.#bot.update({
		// 	ball: this.#ball,
		// 	paddles: this.#paddles,
		// 	scores: this.#scores,
		// })
		const processTime = Date.now() - tickStart
		const delay = Math.max(0, TICK_INTERVAL - processTime)
		if (!this.gameOver) setTimeout(this.#loop.bind(this), delay)
	}

	setInput(player: Player, move: Move, value: boolean) {
		this.#inputs[player][move] = value
	}

	startGame() {
		this.#startTime = Date.now()
		this.#loop()
	}
}
