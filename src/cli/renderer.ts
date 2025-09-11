import { stdout } from 'node:process'
import chalk, { type ChalkInstance } from 'chalk'
import {
	BALL_BASE_SIZE,
	type EngineOptionsEvents,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type Scores,
	type State,
} from '../lib/engine/index.js'
import { useInterpolate } from '../lib/interpolate.js'
import { chars } from './chars.js'
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

const PRIMARY_COLOR = '#4f39f6'
const PRIMARY_COLOR_LIGHT = '#7c86ff'
const FRAME_TIMEOUT = 1000 / 60

export function useRenderer(): Required<EngineOptionsEvents> & {
	stop: () => void
} {
	const { getState, updateState } = useInterpolate()
	let timeout: NodeJS.Timeout | null = null

	function stop() {
		if (timeout) clearTimeout(timeout)
		timeout = null
	}

	const renderBall = useRenderBall()
	const renderPaddles = useRenderPaddles()
	const renderScores = useRenderScores()

	async function render() {
		const now = Date.now()
		if (!screenSizeIsOk()) {
			await ensureSreenSize()
			renderInit()
		}
		const state = getState()
		renderBall(state)
		renderPaddles(state)

		const renderingTime = Date.now() - now
		timeout = setTimeout(render, Math.max(0, FRAME_TIMEOUT - renderingTime))
	}

	return {
		stop,
		onTimerTick(timer) {
			if (timer !== 0) {
				renderString(
					SCREEN_WIDTH / 2 - 2,
					SCREEN_HEIGHT / 2 - 3,
					timer.toString(),
				)
				return
			}
			renderInit()
			renderScores()
			render()
		},
		onCollision(_data) {},
		onTick(state) {
			updateState(state)
		},
		onRoundEnd(round) {
			stop()
			renderScores(round.scores)
		},
		onGameEnd(round) {
			stop()
			renderGameEnd(round.finalRound.scores)
			renderScores(round.finalRound.scores, false)
		},
		onEngineStart() {},
	}
}

function getRounded(n: number) {
	const value = Math.round(n)
	return {
		value,
		delta: value - n,
	}
}

type Cleaner = (format: ChalkInstance) => void

function drawRect(x: number, y: number, w: number, h: number): Cleaner {
	const startX = getRounded(getX(x))
	const startY = getRounded(getY(y))
	const width = Math.floor(getW(w))
	const height = Math.floor(getH(h))
	const endY = startY.value + height
	const line = chalk.bgBlack(' '.repeat(width))
	for (let _y = startY.value; _y < endY; _y++) {
		stdout.cursorTo(startX.value, _y)
		stdout.write(line)
	}

	return (format: ChalkInstance) => {
		const line = format(' '.repeat(width))
		for (let _y = startY.value; _y < endY; _y++) {
			stdout.cursorTo(startX.value, _y)
			stdout.write(line)
		}
	}
}

function useRenderBall() {
	let cleaner: Cleaner = () => {}
	return ({ b }: State) => {
		cleaner(chalk.bgHex('#eee'))
		cleaner = drawRect(b.x, b.y, BALL_BASE_SIZE, BALL_BASE_SIZE)
	}
}

function useRenderPaddles() {
	let cleaner1: Cleaner = () => {}
	let cleaner2: Cleaner = () => {}

	return ({ p1, p2 }: State) => {
		cleaner1(chalk.reset)
		cleaner2(chalk.reset)
		cleaner1 = drawRect(
			PADDLE_BASE_P1_POSITION.x + PADDLE_BASE_WIDTH / 2,
			p1,
			PADDLE_BASE_WIDTH,
			PADDLE_BASE_HEIGHT,
		)
		cleaner2 = drawRect(
			PADDLE_BASE_P2_POSITION.x - PADDLE_BASE_WIDTH / 2,
			p2,
			PADDLE_BASE_WIDTH,
			PADDLE_BASE_HEIGHT,
		)
	}
}

function renderString(
	x: number,
	y: number,
	str: string,
	{
		color = PRIMARY_COLOR,
		resetBackground = true,
		padLeft = 0,
	}: { color?: string; resetBackground?: boolean; padLeft?: number } = {},
) {
	for (let i = str.length; i < padLeft; i++) {
		renderChar('0')
	}
	for (const char of str) {
		renderChar(char)
	}
	function renderChar(c: string) {
		const char = chars[c]
		if (!char) throw new Error(`No char representation for "${c}"`)
		for (const cells of char) {
			stdout.cursorTo(x, y++)
			renderCell(!!cells[0])
			renderCell(!!cells[1])
			renderCell(!!cells[2])
		}
		y -= 5
		x += 8
	}
	function renderCell(active: boolean) {
		if (active) stdout.write(chalk.bgHex(color)('  '))
		else if (resetBackground) stdout.write(chalk.reset('  '))
		else stdout.moveCursor(2, 0)
	}
}

function useRenderScores() {
	let score: Scores = { p1: 0, p2: 0 }
	return (newScore?: Scores, resetBackground = true) => {
		if (newScore) score = newScore
		renderString(SCREEN_WIDTH / 2 - 20, 3, score.p1.toFixed().toString(), {
			color: PRIMARY_COLOR_LIGHT,
			resetBackground,
			padLeft: 2,
		})
		renderString(SCREEN_WIDTH / 2 + 10, 3, score.p2.toFixed().toString(), {
			color: PRIMARY_COLOR_LIGHT,
			resetBackground,
			padLeft: 2,
		})
	}
}

function renderInit() {
	const vertical = chalk.bgHex(PRIMARY_COLOR)('  ')
	const horizontal = chalk.bgHex(PRIMARY_COLOR)(' '.repeat(SCREEN_WIDTH))
	console.clear()
	stdout.cursorTo(0, 0)
	stdout.write(horizontal)
	for (let y = 1; y < SCREEN_HEIGHT - 1; y++) {
		stdout.cursorTo(0, y)
		stdout.write(vertical)
		stdout.cursorTo(SCREEN_WIDTH - 2, y)
		stdout.write(vertical)
	}
	stdout.cursorTo(0, SCREEN_HEIGHT - 1)
	stdout.write(horizontal)
}

function renderGameEnd({ p1, p2 }: Scores) {
	const line = chalk.bgHex(PRIMARY_COLOR)(' '.repeat(SCREEN_WIDTH))
	for (let y = 0; y < SCREEN_HEIGHT; y++) {
		stdout.cursorTo(0, y)
		stdout.write(line)
	}
	renderString(
		SCREEN_WIDTH / 2 - 32,
		SCREEN_HEIGHT / 2 - 3,
		`player ${p1 > p2 ? '1' : '2'} !`,
		{
			color: '#fff',
			resetBackground: false,
		},
	)
}
