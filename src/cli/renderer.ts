import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'
import chalk from 'chalk'
import {
	BALL_BASE_SIZE,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type State,
} from '../lib/engine/index.js'
import { useInterpolate } from '../lib/interpolate.js'
import type { Scope } from './main.js'
import { menuMain } from './menuMain.js'
import {
	ensureSreenSize,
	getH,
	getW,
	getX,
	getY,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
	screenSizeIsOk,
} from './resolution.js'

const FRAME_TIMEOUT = 1000 / 60
// const scores: Scores = { p1: 0, p2: 0 }

export const renderTest: Scope = () => {
	const rl = createInterface({ input: stdin, terminal: true })
	return new Promise((resolve) => {
		stdin.once('keypress', () => {
			rl.close()
			resolve(menuMain)
		})
		console.clear()
		for (let x = 100; x < 700; x += 30) {
			drawRect(x, x / 12, BALL_BASE_SIZE, BALL_BASE_SIZE)
		}
	})
}

export function useRenderer() {
	const { getState, updateState } = useInterpolate()
	let timeout: NodeJS.Timeout

	function start() {
		console.clear()
		renderFrame()
		render()
	}
	async function render() {
		const now = Date.now()
		if (!screenSizeIsOk()) {
			await ensureSreenSize()
			console.clear()
			renderFrame()
		}
		const state = getState()
		renderBall(state)
		renderPaddles(state)
		renderScore()
		const renderingTime = Date.now() - now
		timeout = setTimeout(render, Math.max(0, FRAME_TIMEOUT - renderingTime))
	}

	function stop() {
		if (timeout) clearTimeout(timeout)
	}
	return { start, stop, updateState }
}

function getRounded(n: number) {
	const value = Math.round(n)
	return {
		value,
		delta: value - n,
	}
}

function drawRect(x: number, y: number, w: number, h: number) {
	const startX = getRounded(getX(x) + 0.5)
	const startY = getRounded(getY(y) + 1)
	const width = Math.floor(getW(w))
	const height = Math.floor(getH(h))
	const endY = startY.value + height
	const line = chalk.bgBlack(' '.repeat(width))
	for (let _y = startY.value; _y < endY; _y++) {
		stdout.cursorTo(startX.value, _y)
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
	drawRect(
		PADDLE_BASE_P2_POSITION.x - PADDLE_BASE_WIDTH,
		p2,
		PADDLE_BASE_WIDTH,
		PADDLE_BASE_HEIGHT,
	)
}

function renderScore() {
	// TODO
	// stdout.cursorTo(0, SCREEN_HEIGHT)
	// stdout.write(`p1: ${scores.p1}, p2: ${scores.p2}`)
}

const PRIMARY_COLOR = '#4f39f6'

function renderFrame() {
	const vertical = chalk.bgHex(PRIMARY_COLOR)('  ')
	const horizontal = chalk.bgHex(PRIMARY_COLOR)(' '.repeat(SCREEN_WIDTH))
	stdout.cursorTo(0, 0)
	stdout.write(horizontal)
	for (let i = 1; i < SCREEN_HEIGHT - 1; i++) {
		stdout.cursorTo(0, i)
		stdout.write(vertical)
		stdout.cursorTo(SCREEN_WIDTH - 2, i)
		stdout.write(vertical)
	}
	stdout.cursorTo(0, SCREEN_HEIGHT - 1)
	stdout.write(horizontal)
}
