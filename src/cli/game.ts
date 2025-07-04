import { exit, stdin, stdout } from 'node:process'
import { emitKeypressEvents, createInterface } from 'node:readline'
import {
	ENGINE_EVENT,
	type Move,
	type Player,
	type EngineEventData,
} from '../lib/engine/index.js'

export function startGame() {
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

	function terminate() {
		rl.close()
		socket.close()
		stdout.write('Bye')
		exit(0)
	}
}

function connectEngine(): WebSocket {
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
	return socket
}
