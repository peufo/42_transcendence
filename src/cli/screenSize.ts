import { stdout } from 'node:process'
import { ARENA_HEIGHT, ARENA_WIDTH } from '../lib/engine/index.js'

const MIN_COLUMNS = Math.floor(ARENA_WIDTH / 10)
const MIN_ROWS = Math.floor(ARENA_HEIGHT / 20) + 1

const screenSizeIsOk = () =>
	!(stdout.columns < MIN_COLUMNS || stdout.rows < MIN_ROWS)

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
	renderFrame()
	const msg = 'Larger screen needed !'
	const msgScreenExpected = `Minimal : ${padStart(MIN_COLUMNS)} x ${padStart(MIN_ROWS)}`
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
	stdout.write('  Welcome in Transcandence')
	stdout.cursorTo(stdout.columns, stdout.rows)
}

function renderFrame() {
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
