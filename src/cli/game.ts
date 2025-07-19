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
	if (!checkSizeRequirements()) return
	emitKeypressEvents(stdin)
	const rl = createInterface({ input: stdin, terminal: true })
	rl.once('SIGINT', terminate)
	stdout.write('\x1bc')
	renderScores(0, 0)
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
		if (!checkSizeRequirements()) terminate()
	})

	function terminate() {
		rl.close()
		socket.close()
		stdout.write('Bye\n')
		// exit(0)
	}
}

// rendering characters
const CHAR_TOP = '▀'
const CHAR_BOTTOM = '▄'
const CHAR_LEFT = '▌'
const CHAR_RIGHT = '▐'
const CHAR_TOP_LEFT = '▛'
const CHAR_TOP_RIGHT = '▜'
const CHAR_BOTTOM_LEFT = '▙'
const CHAR_BOTTOM_RIGHT = '▟'
const CHAR_BALL = '■'
const CHAR_PADDLE = '█'

// conversion to terminal sizes
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

function checkSizeRequirements(): boolean {
	const windowSize = stdout.getWindowSize() // [0]: width, [1]: height
	if (windowSize[0] < TTY_WIDTH || windowSize[1] < TTY_HEIGHT) {
		stdout.write(`Your terminal should be atleast ${TTY_WIDTH}:${TTY_HEIGHT} (current size: ${windowSize[0]}:${windowSize[1]}) for the game to render properly\n`)
		return false
	}
	return true
}

let lastRender: string[] = []

function render(state: State) {
	const currentRender: string[] = []

	for (let y = 0; y < TTY_HEIGHT; y++) {
		let line = ''
		for (let x = 0; x < TTY_WIDTH; x++) {
			if (y === 0 && x === 0) line += CHAR_TOP_LEFT
			else if (y === 0 && x === TTY_WIDTH - 1) line += CHAR_TOP_RIGHT
			else if (y === TTY_HEIGHT - 1 && x === 0) line += CHAR_BOTTOM_LEFT
			else if (y === TTY_HEIGHT - 1 && x === TTY_WIDTH - 1) line += CHAR_BOTTOM_RIGHT
			else if (y === 0) line += CHAR_TOP
			else if (y === TTY_HEIGHT - 1) line += CHAR_BOTTOM
			else if (x === 0) line += CHAR_LEFT
			else if (x === TTY_WIDTH - 1) line += CHAR_RIGHT
			else if (
				(x === TTY_P1_X &&
					y >= state.p1 &&
					y <= state.p1 + TTY_PADDLE_HEIGHT) ||
				(x === TTY_P2_X && y >= state.p2 && y <= state.p2 + TTY_PADDLE_HEIGHT)
			)
				line += CHAR_PADDLE
			else if (x === state.b.x && y === state.b.y) line += CHAR_BALL
			else line += ' '
		}
		currentRender.push(line)

		if (!lastRender[y] || lastRender[y] !== line) {
			stdout.cursorTo(0, y)
			stdout.write(line)
		}
	}
	lastRender = currentRender
	stdout.cursorTo(0, TTY_HEIGHT + 1);
}

function renderScores(p1: number, p2: number) {
	stdout.cursorTo(0, TTY_HEIGHT + 1);
	stdout.write(`Player 1: ${p1} | Player 2: ${p2}`)
}

function connectEngine(): WebSocket {
	const socket = new WebSocket('ws://localhost:8000/ws') // use correct address
	socket.addEventListener('message', (event) => {
		const data: EngineEventData = JSON.parse(event.data)
		const newState = data[EVENT_TYPE.TICK]
		const newScores = data[EVENT_TYPE.SCORE]
		if (newState) {
			render(convertState(newState))
		}
		if (newScores) {
			renderScores(newScores.p1, newScores.p2)
		}
	})
	return socket
}
