import { stdin, stdout } from 'node:process'
import { createInterface, emitKeypressEvents } from 'node:readline'
import pc from 'picocolors'
import {
	BALL_BASE_SIZE,
	Engine,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type Scores,
	type State,
} from '../lib/engine/index.js'
import { useInterpolate } from '../lib/interpolate.js'
import type { Scope } from './main.js'
import { menuMain } from './menuMain.js'
import { ensureSreenSize, getX, getY, SCREEN_HEIGHT } from './resolution.js'

const FRAME_TIMEOUT = 1000 / 60
const interpolate = useInterpolate()
let scores: Scores = { p1: 0, p2: 0 }
let timeout: NodeJS.Timeout

export const startGameLocal: Scope = () => {
	emitKeypressEvents(stdin)
	const rl = createInterface({ input: stdin, terminal: true })

	const engine = new Engine({
		scoreToWin: 3,
		onTick(data) {
			interpolate.updateState(data)
		},
		onRoundEnd(data) {
			engine.setInput('p1', 'down', false)
			engine.setInput('p1', 'up', false)
			engine.setInput('p2', 'down', false)
			engine.setInput('p2', 'up', false)
			scores = data.scores
		},
	})

	return new Promise((resolve) => {
		const keyHandlers: Record<string, () => void> = {
			w() {
				engine.setInput('p1', 'up', true)
				engine.setInput('p1', 'down', false)
			},
			s() {
				engine.setInput('p1', 'up', false)
				engine.setInput('p1', 'down', false)
			},
			x() {
				engine.setInput('p1', 'up', false)
				engine.setInput('p1', 'down', true)
			},
			i() {
				engine.setInput('p2', 'up', true)
				engine.setInput('p2', 'down', false)
			},
			j() {
				engine.setInput('p2', 'up', false)
				engine.setInput('p2', 'down', false)
			},
			n() {
				engine.setInput('p2', 'up', false)
				engine.setInput('p2', 'down', true)
			},
			q: terminate,
		}

		function onKeyPress(key: string) {
			keyHandlers[key]?.()
		}

		function terminate() {
			console.clear()
			rl.close()
			engine.stop()
			if (timeout) {
				clearTimeout(timeout)
			}
			stdin.off('keypress', onKeyPress)
			resolve(menuMain)
		}

		rl.once('SIGINT', terminate)
		stdin.on('keypress', onKeyPress)
		engine.start()
		render()
	})
}

async function render() {
	const start = Date.now()
	await ensureSreenSize()
	console.clear()
	const state = interpolate.getState()
	renderBall(state)
	renderPaddles(state)
	renderScore()
	const renderingTime = Date.now() - start
	timeout = setTimeout(render, Math.max(0, FRAME_TIMEOUT - renderingTime))
}

function drawRect(x: number, y: number, w: number, h: number) {
	const startX = getX(x)
	const endY = getY(y + h)
	const line = pc.bgBlack(' '.repeat(getX(x + w) - startX))
	for (let _y = getY(y); _y < endY; _y++) {
		stdout.cursorTo(startX, _y)
		stdout.write(line)
	}
}

function renderBall({ b }: State) {
	drawRect(
		b.x - BALL_BASE_SIZE / 2,
		b.y - BALL_BASE_SIZE / 2,
		BALL_BASE_SIZE,
		BALL_BASE_SIZE,
	)
}

function renderPaddles({ p1, p2 }: State) {
	drawRect(PADDLE_BASE_P1_POSITION.x, p1, PADDLE_BASE_WIDTH, PADDLE_BASE_HEIGHT)
	drawRect(PADDLE_BASE_P2_POSITION.x, p2, PADDLE_BASE_WIDTH, PADDLE_BASE_HEIGHT)
}

function renderScore() {
	stdout.cursorTo(0, SCREEN_HEIGHT)
	stdout.write(`p1: ${scores.p1}, p2: ${scores.p2}`)
}
