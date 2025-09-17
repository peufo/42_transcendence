import { stdout } from 'node:process'
import { ARENA_HEIGHT, ARENA_WIDTH } from '../lib/engine/index.js'

// const RESOLUTION = 7 // number of pixels per char
const RESOLUTION = 5

export const SCREEN_WIDTH = Math.floor(ARENA_WIDTH / RESOLUTION) + 4
export const SCREEN_HEIGHT = Math.floor(ARENA_HEIGHT / (RESOLUTION * 2)) + 2
export const getW = (w: number) => w / RESOLUTION
export const getH = (h: number) => h / (RESOLUTION * 2)
export const getX = (x: number) => clamp(getW(x) + 2, 2, SCREEN_WIDTH - 4)
export const getY = (y: number) => clamp(getH(y) + 1, 1, SCREEN_HEIGHT - 2)

function clamp(v: number, min: number, max: number) {
	if (v < min) return min
	if (v > max) return max
	return v
}

export const screenSizeIsOk = () =>
	!(stdout.columns < SCREEN_WIDTH || stdout.rows < SCREEN_HEIGHT)

export function ensureSreenSize() {
	return new Promise<void>((resolve) => {
		checkScreenSize()
		stdout.on('resize', checkScreenSize)
		function checkScreenSize() {
			if (!screenSizeIsOk()) return renderScreenSizeInfo()
			stdout.off('resize', checkScreenSize)
			resolve()
		}
	})
}

function padStart(n: number): string {
	return n.toString().padStart(3, ' ')
}

function renderScreenSizeInfo() {
	renderPendingResize()
	const msg = 'Larger screen needed !'
	const msgScreenExpected = `Minimal : ${padStart(SCREEN_WIDTH)} x ${padStart(SCREEN_HEIGHT)}`
	const msgScreenCurrent = `Actual  : ${padStart(stdout.columns)} x ${padStart(stdout.rows)}`
	const row = Math.floor(stdout.rows / 2)
	const col = Math.floor(stdout.columns / 2 - msgScreenExpected.length / 2)
	stdout.cursorTo(col - 1, row - 2)
	stdout.write(msg)
	stdout.cursorTo(col, row)
	stdout.write(msgScreenExpected)
	stdout.cursorTo(col, row + 1)
	stdout.write(msgScreenCurrent)
	stdout.cursorTo(0, stdout.rows)
	stdout.write('  Welcome to Transcendance')
	stdout.cursorTo(stdout.columns, stdout.rows)
}

function renderPendingResize() {
	console.clear()
	stdout.cursorTo(0, 2)
	stdout.write('  ╭')
	stdout.write('─'.repeat(stdout.columns - 6))
	stdout.write('╮\n')
	for (let i = 0; i < stdout.rows - 6; i++) {
		stdout.write('  │')
		stdout.write(' '.repeat(stdout.columns - 6))
		stdout.write('│\n')
	}
	stdout.write('  ╰')
	stdout.write('─'.repeat(stdout.columns - 6))
	stdout.write('╯\n')
}
