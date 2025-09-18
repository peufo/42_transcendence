import { stdin } from 'node:process'
import { createInterface, emitKeypressEvents } from 'node:readline'
import type { Move, Player } from '../lib/engine/index.js'
import type { Match } from '../lib/type.js'
import { api } from './api.js'
import type { Scope } from './main.js'
import { menuMain } from './menuMain.js'
import { menuTournament } from './menuTournament.js'
import { useRenderer } from './renderer.js'
import { ensureSreenSize } from './resolution.js'
import { socketChannelCLI } from './socketChannelCLI.js'

export const menuMatchRemote: Scope<[Match]> = async (match) => {
	return new Promise((resolve) => {
		ensureSreenSize().then(() => {
			console.clear()
			const renderer = useRenderer()
			const matchChannel = socketChannelCLI(
				'matches',
				{ matchId: match.id.toString() },
				{
					onEngineEvent(data) {
						renderer.onEngineEvent(data)
						if (data.onGameEnd) {
							terminate()
						}
					},
				},
			)

			const userId = api.user()?.id
			const player: Player = userId === match.player1Id ? 'p1' : 'p2'

			const setInput = (move: Move, value: boolean) => {
				matchChannel.emit('onPlayerInput', { player, move, value })
			}

			const keyHandlers: Record<string, () => void> = {
				w: () => {
					setInput('up', true)
					setInput('down', false)
				},
				s: () => {
					setInput('up', false)
					setInput('down', false)
				},
				x: () => {
					setInput('up', false)
					setInput('down', true)
				},
			}

			function onKeyPress(key: string) {
				keyHandlers[key]?.()
			}

			const rl = createInterface({ input: stdin, terminal: true })
			emitKeypressEvents(stdin)
			stdin.on('keypress', onKeyPress)

			function terminate() {
				console.clear()
				matchChannel.close()
				rl.close()
				renderer.stop()
				stdin.off('keypress', onKeyPress)
				if (match.tournamentId) {
					resolve(menuTournament(match.tournamentId))
				}
				resolve(menuMain)
			}
		})
	})
}
