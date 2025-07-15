import { exit, stdin, stdout } from 'node:process'
import rl from 'node:readline'

rl.emitKeypressEvents(stdin)
stdin.setRawMode(true)

const dot = {
	x: 1,
	y: 1,
}

stdout.on('resize', () => {
	console.log('size changed')
	console.log(`${stdout.columns}x${stdout.rows}`)
	render()
})

const keyHandler = {
	up: () => dot.y--,
	down: () => dot.y++,
	left: () => dot.x--,
	right: () => dot.x++,
}

stdin.on('keypress', (str, { name }: { name: string }) => {
	if (str === 'q') exit(0)
	if (name in keyHandler) {
		const key = name as keyof typeof keyHandler
		keyHandler[key]()
		render()
		return
	}
})

function renderFrame() {
	stdout.cursorTo(0, 0)
	stdout.write('╭')
	stdout.write('─'.repeat(stdout.columns - 2))
	stdout.write('╮')
	for (let i = 0; i < stdout.rows - 2; i++) {
		stdout.write('│')
		stdout.write(' '.repeat(stdout.columns - 2))
		stdout.write('│')
	}
	stdout.write('╰')
	stdout.write('─'.repeat(stdout.columns - 2))
	stdout.write('╯')
}

function render() {
	renderFrame()

	stdout.cursorTo(dot.x, dot.y)
	stdout.write('█')
	stdout.cursorTo(0, 0)
	// stdout.write('▀')
}

render()
