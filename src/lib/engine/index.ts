import { Paddle } from './Paddle.js'
import { Ball } from './Ball.js'
import { Vector2 } from './Vector2.js'

// types
type Player = 'p1' | 'p2'
export type Move = 'down' | 'up'
type Paddles = Record<Player, Paddle | null>
type Inputs = Record<Player, Record<Move, boolean>>
type Scores = Record<Player, number>
type State = {
	ball: Ball
	paddles: Paddles
	scores: Scores
}

// Game properties
const TICK_RATE = 30
export const TICK_INTERVAL = 1000 / TICK_RATE
export const ARENA_WIDTH = 1000
export const ARENA_HEIGHT = 1000
const scores: Scores = {
	p1: 0,
	p2: 0,
}
export const inputs: Inputs = {
	p1: { down: false, up: false },
	p2: { down: false, up: false },
}

// Ball properties
// TODO: speed cap
export const BALL_SPEED_RAMP = 1.07
export const BALL_MAX_BOUNCE_ANGLE = (4 * Math.PI) / 12 // <- 60 degrees in radians
export const BALL_BASE_SPEED = 0.35
const BALL_BASE_SIZE = 12
const BALL_BASE_POSITION = new Vector2(
	ARENA_WIDTH / 2 - BALL_BASE_SIZE / 2,
	ARENA_HEIGHT / 2 - BALL_BASE_SIZE / 2,
)
export let ball: Ball

// Paddle properties
export const PADDLE_BASE_SPEED = 0.5
const PADDLE_BASE_HEIGHT = ARENA_HEIGHT / 5
const PADDLE_BASE_WIDTH = ARENA_WIDTH / 60
const PADDLE_OFFSET_FROM_WALL = PADDLE_BASE_WIDTH
const PADDLE_BASE_P1_POSITION = new Vector2(
	PADDLE_OFFSET_FROM_WALL,
	ARENA_HEIGHT / 2 - PADDLE_BASE_HEIGHT / 2,
)
const PADDLE_BASE_P2_POSITION = new Vector2(
	ARENA_WIDTH - PADDLE_BASE_WIDTH - PADDLE_OFFSET_FROM_WALL,
	ARENA_HEIGHT / 2 - PADDLE_BASE_HEIGHT / 2,
)
export const paddles: Paddles = {
	p1: null,
	p2: null,
}

// API
function setInput(player: Player, move: Move, value: boolean) {
	inputs[player][move] = value
}

function getState(): State {
	return {
		ball,
		paddles,
		scores,
	}
}

function startGame() {
	initState()
	game()
}

export const engine = {
	startGame,
	setInput,
	getState,
}

// Logic
function initState() {
	paddles.p1 = new Paddle(
		PADDLE_BASE_P1_POSITION,
		PADDLE_BASE_WIDTH,
		PADDLE_BASE_HEIGHT,
	)
	paddles.p2 = new Paddle(
		PADDLE_BASE_P2_POSITION,
		PADDLE_BASE_WIDTH,
		PADDLE_BASE_HEIGHT,
	)
	ball = new Ball(BALL_BASE_POSITION, BALL_BASE_SIZE)
}

function updateState() {
	paddles.p1?.update(inputs.p1)
	paddles.p2?.update(inputs.p2)
	ball.update()
}

function game() {
	const tickStart = Date.now()
	updateState()
	// broadcast state
	const processTime = Date.now() - tickStart
	const delay = Math.max(0, TICK_INTERVAL - processTime)
	setTimeout(game, delay)
}

export function scorePoint(player: Player) {
	scores[player]++
	initState()
}

// // frontend

// // draw logic

// // ball
// 	draw() {
// 		ctx?.beginPath()
// 		ctx?.rect(this.position.x, this.position.y, this.#size, this.#size)
// 		ctx?.fill()
// 	}

// // paddle
// 	draw() {
// 		ctx?.beginPath()
// 		ctx?.rect(this.position.x, this.position.y, this.#width, this.#height)
// 		ctx?.fill()
// 	}

// //
// function drawAll() {
// 	ctx?.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
// 	ball.draw()
// 	paddles.p1.draw()
// 	paddles.p2.draw()

// 	const str = `Player 1: ${scores.p1} | Player 2: ${scores.p2}`
// 	ctx.textAlign = 'center'
// 	ctx.fillText(str, ARENA_WIDTH / 2, 10)
// }

// // inputs

// const keyHandlers: Record<string, (value: boolean) => void> = {
// 	w: (value) => setInput('p1', 'up', value),
// 	s: (value) => setInput('p1', 'down', value),
// 	i: (value) => setInput('p2', 'up', value),
// 	k: (value) => setInput('p2', 'down', value),
// }

// document.addEventListener('keydown', (event) => {
// 	keyHandlers[event.key]?.(true)
// })

// document.addEventListener('keyup', (event) => {
// 	keyHandlers[event.key]?.(false)
// })
