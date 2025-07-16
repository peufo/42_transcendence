import { exit, stdin, stdout } from 'node:process'
import { createInterface, emitKeypressEvents } from 'node:readline'
import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	type EngineEventData,
	EVENT_TYPE,
	type Move,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type Player,
	type State,
} from '../lib/engine/index.js'

export function start() {
	emitKeypressEvents(stdin)
	const rl = createInterface({ input: stdin, terminal: true })
	rl.once('SIGINT', terminate)
	const socket = connectEngine()
	const setInput = (player: Player, move: Move, value: boolean) => {
		socket.send(JSON.stringify({ player, move, value }))
	}
	const keyHandlers: Record<string, () => void> = {
		w() {
			setInput('p1', 'up', true)
			setInput('p1', 'down', false)
		},
		s() {
			setInput('p1', 'up', false)
			setInput('p1', 'down', false)
		},
		x() {
			setInput('p1', 'up', false)
			setInput('p1', 'down', true)
		},
		i() {
			setInput('p2', 'up', true)
			setInput('p2', 'down', false)
		},
		j() {
			setInput('p2', 'up', false)
			setInput('p2', 'down', false)
		},
		n() {
			setInput('p2', 'up', false)
			setInput('p2', 'down', true)
		},
	}

	stdin.on('keypress', (key) => {
		keyHandlers[key]?.()
	})

	stdout.on('resize', () => {
		if (!checkSizeRequirements()) terminate() // handle
	})

	function terminate() {
		rl.close()
		socket.close()
		stdout.write('Bye')
		exit(0)
	}
}

const horizontal = '─'
const vertical = '│'
const topLeft = '┌'
const topRight = '┐'
const bottomLeft = '└'
const bottomRight = '┘'
const ball = '●'

function checkSizeRequirements(): boolean {
	const windowSize = stdout.getWindowSize() // 0: width, 1: height
	if (windowSize[0] < ARENA_WIDTH / 10 || windowSize[1] < ARENA_HEIGHT / 20)
		return false
	return true
}

// function render(state: State) {
// 	const width = Math.floor(ARENA_WIDTH / 10)
// 	const height = Math.floor(ARENA_HEIGHT / 20)
// 	stdout.write('\x1bc') // clear screen
// 	let str = ''
// 	for (let y = 0; y < height; y++) {
// 		for (let x = 0; x < width; x++) {
// 			if (y === 0 && x === 0) str += topLeft
// 			else if (y === 0 && x === width - 1) str += topRight
// 			else if (y === height - 1 && x === 0) str += bottomLeft
// 			else if (y === height - 1 && x === width - 1) str += bottomRight
// 			else if (y === 0 || y === height - 1) str += horizontal
// 			else if (x === 0 || x === width - 1) str += vertical
// 			else if (
// 				(x ===
// 					Math.floor((PADDLE_BASE_P1_POSITION.x + PADDLE_BASE_WIDTH) / 10) &&
// 					y >= Math.floor(state.p1 / 20) &&
// 					y <= Math.floor((state.p1 + PADDLE_BASE_HEIGHT) / 20)) ||
// 				(x === Math.floor(PADDLE_BASE_P2_POSITION.x / 10) &&
// 					y >= Math.floor(state.p2 / 20) &&
// 					y <= Math.floor((state.p2 + PADDLE_BASE_HEIGHT) / 20))
// 			)
// 				str += vertical
// 			else if (
// 				x === Math.floor(state.b.x / 10) &&
// 				y === Math.floor(state.b.y / 20)
// 			)
// 				str += ball
// 			else str += ' '
// 		}
// 		str += '\n'
// 	}
// 	stdout.write(str)
// }

const X_DIVIDER = 10
const Y_DIVIDER = 20

const TTY_WIDTH = Math.floor(ARENA_WIDTH / X_DIVIDER)
const TTY_HEIGHT = Math.floor(ARENA_HEIGHT / Y_DIVIDER)
const TTY_PADDLE_HEIGHT = Math.floor(PADDLE_BASE_HEIGHT / Y_DIVIDER)
const TTY_P1_X = Math.floor(
	(PADDLE_BASE_P1_POSITION.x + PADDLE_BASE_WIDTH) / X_DIVIDER,
)
const TTY_P2_X = Math.floor(PADDLE_BASE_P2_POSITION.x / X_DIVIDER)

function convertState(state: State): State {
	return {
		b: {
			x: Math.floor(state.b.x / X_DIVIDER),
			y: Math.floor(state.b.y / Y_DIVIDER),
		},
		p1: Math.floor(state.p1 / Y_DIVIDER),
		p2: Math.floor(state.p2 / Y_DIVIDER),
	}
}

let lastFrame: string[] = []
let lastState: State | null = null

function render(state: State) {
	if (state === lastState) {
		console.log('bite')
		return
	}
	const currentFrame: string[] = []

	let frameStr = ''
	for (let y = 0; y < TTY_HEIGHT; y++) {
		let line = ''
		for (let x = 0; x < TTY_WIDTH; x++) {
			if (y === 0 && x === 0) line += topLeft
			else if (y === 0 && x === TTY_WIDTH - 1) line += topRight
			else if (y === TTY_HEIGHT - 1 && x === 0) line += bottomLeft
			else if (y === TTY_HEIGHT - 1 && x === TTY_WIDTH - 1) line += bottomRight
			else if (y === 0 || y === TTY_HEIGHT - 1) line += horizontal
			else if (x === 0 || x === TTY_WIDTH - 1) line += vertical
			else if (
				(x === TTY_P1_X &&
					y >= state.p1 &&
					y <= state.p1 + TTY_PADDLE_HEIGHT) ||
				(x === TTY_P2_X && y >= state.p2 && y <= state.p2 + TTY_PADDLE_HEIGHT)
			)
				line += vertical
			else if (x === state.b.x && y === state.b.y) line += ball
			else line += ' '
		}
		currentFrame.push(line)

		if (!lastFrame[y] || lastFrame[y] !== line) {
			frameStr += `\x1b[${y + 1};1H${line}`
		}
	}

	if (!lastFrame.length) {
		frameStr = `\x1b[1;1H${frameStr}`
	}

	stdout.write(frameStr)
	lastFrame = currentFrame
	lastState = state
}

function connectEngine(): WebSocket {
	const socket = new WebSocket('ws://localhost:8000/ws')
	socket.addEventListener('message', (event) => {
		const data: EngineEventData = JSON.parse(event.data)
		const newState = data[EVENT_TYPE.TICK]
		const newScores = data[EVENT_TYPE.SCORE]
		if (newState) {
			render(convertState(newState))
		}
		if (newScores) {
			console.log(newScores)
		}
	})
	return socket
}
