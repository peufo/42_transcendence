import { exit, stdin, stdout } from 'node:process'
import { emitKeypressEvents, createInterface } from 'node:readline'
import {
	EVENT_TYPE,
	type Move,
	type Player,
	type EngineEventData,
	type State,
	ARENA_WIDTH,
	ARENA_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
} from '../lib/engine/index.js'
import { ReadStream } from 'node:fs'
import { WriteStream } from 'node:tty'

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

	stdin.on('keypress', (key, state) => {
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

function render(state: State) {
	const width = Math.floor(ARENA_WIDTH / 10)
	const height = Math.floor(ARENA_HEIGHT / 20)
	stdout.write('\x1bc')
	let str = ''
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (y === 0 && x === 0) str += topLeft
			else if (y === 0 && x === width - 1) str += topRight
			else if (y === height - 1 && x === 0) str += bottomLeft
			else if (y === height - 1 && x === width - 1) str += bottomRight
			else if (y === 0 || y === height - 1) str += horizontal
			else if (x === 0 || x === width - 1) str += vertical
			else if (
				(x ===
					Math.floor((PADDLE_BASE_P1_POSITION.x + PADDLE_BASE_WIDTH) / 10) &&
					y >= Math.floor(state.p1 / 20) &&
					y <= Math.floor((state.p1 + PADDLE_BASE_HEIGHT) / 20)) ||
				(x === Math.floor(PADDLE_BASE_P2_POSITION.x / 10) &&
					y >= Math.floor(state.p2 / 20) &&
					y <= Math.floor((state.p2 + PADDLE_BASE_HEIGHT) / 20))
			)
				str += vertical
			else if (
				x === Math.floor(state.b.x / 10) &&
				y === Math.floor(state.b.y / 20)
			)
				str += ball
			else str += ' '
		}
		str += '\n'
	}
	stdout.write(str)
}

function connectEngine(): WebSocket {
	const socket = new WebSocket('ws://localhost:8000/ws')
	socket.addEventListener('message', (event) => {
		const data: EngineEventData = JSON.parse(event.data)
		const newState = data[EVENT_TYPE.TICK]
		const newScores = data[EVENT_TYPE.SCORE]
		if (newState) {
			render(newState)
		}
		if (newScores) {
			console.log(newScores)
		}
	})
	return socket
}
