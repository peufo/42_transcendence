import { stdin, stdout } from 'node:process'
import { createInterface, emitKeypressEvents } from 'node:readline'
import pc from 'picocolors'
import type {
	// ARENA_HEIGHT,
	// ARENA_WIDTH,
	EngineEventData,
	Move,
	// PADDLE_BASE_HEIGHT,
	// PADDLE_BASE_P1_POSITION,
	// PADDLE_BASE_P2_POSITION,
	// PADDLE_BASE_WIDTH,
	Player,
	Scores,
	State,
} from '../lib/engine/index.js'
import { useInterpolate } from '../lib/interpolate.js'
import type { Scope } from './main.js'
import { ensureSreenSize } from './screenSize.js'

const FRAME_TIMEOUT = 1000 / 60
const interpolate = useInterpolate()
let scores: Scores = { p1: 0, p2: 0 }
let timeout: NodeJS.Timeout
let isGameRunning = false

export const startGame: Scope = () => {
	emitKeypressEvents(stdin)
	const rl = createInterface({ input: stdin, terminal: true })
	rl.once('SIGINT', terminate)
	stdout.write('\x1bc')
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

	function onKeyPress(key: string) {
		keyHandlers[key]?.()
	}

	stdin.on('keypress', onKeyPress)
	// TODO: escape
	// stdin.on('keypress', console.log)

	function terminate() {
		rl.close()
		socket.close()
		if (timeout) clearTimeout(timeout)
		stdin.off('keypress', onKeyPress)
		stdout.write('Bye\n')
		isGameRunning = false
	}

	isGameRunning = true
	render()

	return null
}

async function render() {
	const start = Date.now()
	await ensureSreenSize()
	console.clear()
	const state = interpolate.getState()
	renderBall(state)
	if (isGameRunning) {
		const renderingTime = Date.now() - start
		timeout = setTimeout(render, Math.max(0, FRAME_TIMEOUT - renderingTime))
	}
}

function renderBall(state: State) {
	const col = Math.floor(state.b.x / 10)
	const row = Math.floor(state.b.y / 20)
	// const char = state.b.y % 2 ? '▄' : '▀'
	const char = Math.floor(state.b.y / 2) % 2 ? pc.white(pc.bgBlack('▅▅')) : '▅▅'
	stdout.cursorTo(col, row)
	stdout.write(char)
	stdout.cursorTo(0, stdout.rows)
	stdout.write(Math.floor(state.b.y).toString())
	stdout.write('  ')
	stdout.write((Math.floor(state.b.y) % 2).toString())
	stdout.write('▄▀▄▀▆▅_')
	stdout.write(`p1: ${scores.p1}, p2: ${scores.p2}`)
}

function connectEngine(): WebSocket {
	const socket = new WebSocket('ws://localhost:8000/ws') // use correct address
	socket.addEventListener('message', async (event) => {
		const data: EngineEventData = JSON.parse(event.data)
		if (data.onTick) {
			interpolate.updateState(data.onTick)
		}
		if (data.onRoundEnd) {
			scores = data.onRoundEnd.scores
		}
	})
	return socket
}
