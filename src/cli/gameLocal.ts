import { stdin } from 'node:process'
import { createInterface, emitKeypressEvents } from 'node:readline'
import { Engine } from '../lib/engine/index.js'
import type { Scope } from './main.js'
import { menuMain } from './menuMain.js'
import { useRenderer } from './renderer.js'
import { ensureSreenSize } from './resolution.js'

export const startGameLocal: Scope = () => {
	emitKeypressEvents(stdin)
	const rl = createInterface({ input: stdin, terminal: true })
	const renderer = useRenderer()

	return new Promise((resolve) => {
		const engine = new Engine({
			pointsToWin: 3,
			...renderer,
			onRoundEnd(round) {
				engine.setInput('p1', 'down', false)
				engine.setInput('p1', 'up', false)
				engine.setInput('p2', 'down', false)
				engine.setInput('p2', 'up', false)
				renderer.onRoundEnd(round)
			},
			onGameEnd(data) {
				renderer.onGameEnd(data)
				setTimeout(terminate, 2500)
			},
		})
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
			renderer.stop()
			stdin.off('keypress', onKeyPress)
			resolve(menuMain)
		}
		rl.once('SIGINT', terminate)
		stdin.on('keypress', onKeyPress)
		ensureSreenSize().then(() => {
			console.clear()
			engine.start()
		})
	})
}
