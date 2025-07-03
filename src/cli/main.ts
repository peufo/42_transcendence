import { ENGINE_EVENT, type EngineEventData } from '../lib/engine/index.js'
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { emitKeypressEvents } from 'node:readline'
import { Writable } from 'node:stream'

stdin.write('Transcendance\n')
let isMuted = false
const rl = createInterface({
	input: stdin,
	terminal: true,
})

emitKeypressEvents(stdin)

stdin.on('keypress', (str) => {
	if (!isMuted) stdout.write(str)
})

const username = await rl.question('Username:\n')
console.log(`Your username: ${username}`)

isMuted = true
const password = await rl.question('Password:\n')
console.log(`Your password: ${password}`)

const socket = new WebSocket('ws://localhost:8000/ws')
socket.addEventListener('message', (event) => {
	const data: EngineEventData = JSON.parse(event.data)
	console.log(data)
	const newState = data[ENGINE_EVENT.TICK]
	const newScores = data[ENGINE_EVENT.SCORE]
	if (newState) {
		console.log(newState)
	}
	if (newScores) {
		console.log(newScores)
	}
})

// Enter in the game
// stdin.setRawMode(true)

stdin.on('data', (buffer) => {
	if (buffer.toString() === 'q') {
		socket.close()
		process.exit()
	}
	if (buffer.toString() === 'w')
		socket.send(JSON.stringify({ player: 'p1', move: 'up', value: true }))
})
