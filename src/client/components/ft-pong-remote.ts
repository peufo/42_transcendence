import type { Move, Player } from '../../lib/engine/index.js'
import type { ChannelSocket } from '../../lib/useSocketChannels.js'
import type { Renderer } from '../renderer/Renderer.js'
import { Renderer2D } from '../renderer/Renderer2D.js'
import { Renderer3D } from '../renderer/Renderer3D.js'
import { socketChannel } from '../socketChannel.js'
import { defineComponent } from '../utils/component.js'
import { $match, $myRenderer, $user } from '../utils/store.js'
import { toast } from './ft-toast.js'

defineComponent('ft-pong-remote', () => {
	let renderer: Renderer

	function setupInputs(player: Player, channel: ChannelSocket<'matches'>) {
		const setInput = (move: Move, value: boolean) => {
			channel.emit('onPlayerInput', { player, move, value })
		}

		const keyHandlers: Record<string, (value: boolean) => void> = {
			w: (value) => setInput('up', value),
			s: (value) => setInput('down', value),
			ArrowUp: (value) => setInput('up', value),
			ArrowDown: (value) => setInput('down', value),
			a: (value) => setInput('up', value),
			d: (value) => setInput('down', value),
			ArrowLeft: (value) => setInput('up', value),
			ArrowRight: (value) => setInput('down', value),
		}

		const onKeyDown = (event: KeyboardEvent) => {
			keyHandlers[event.key]?.(true)
		}
		const onKeyUp = (event: KeyboardEvent) => {
			keyHandlers[event.key]?.(false)
		}

		document.addEventListener('keydown', onKeyDown)
		document.addEventListener('keyup', onKeyUp)

		return () => {
			document.removeEventListener('keydown', onKeyDown)
			document.removeEventListener('keyup', onKeyUp)
			return
		}
	}

	return {
		onLoad() {
			const user = $user.get(false)
			const match = $match.get(false)
			if (!match || !user) throw new Error('no user or match')

			const player: Player = user.id === match.player1Id ? 'p1' : 'p2'
			const channel = socketChannel(
				'matches',
				{ matchId: match.id.toString() },
				{
					onEngineEvent: (data) => {
						renderer.onEngineEvent(data)
						if (data.onGameEnd !== undefined) {
							toast.success('Game end')
						}
					},
				},
			)
			const cleanInputs = setupInputs(player, channel)
			return () => {
				cleanInputs()
				channel.close()
			}
		},
		render() {
			const match = $match.get()
			if (!match) {
				return /*html*/ `
					<div class="h-[100%] w-[100%] flex flex-row items-center justify-center">
						You don't have any match.
					</div>
				`
			}
			if (match.state === 'awaiting') {
				return /*html*/ `
					<div class="flex flex-row col-span-2 justify-center items-center animate-bounce font-bold w-full">
						Waiting for player
					</div>
				`
			}
			if (match.state === 'finished') {
				return /*html*/ `
					<div class="h-[100%] w-[100%] flex flex-row items-center justify-center">
						Game over, ${match.player1Score > match.player2Score ? match.player1?.name : match.player2?.name} won
					</div>
				`
			}
			return /*html*/ `
					<div class="flex flex-row items-center justify-center">
						Points required to win the match: ${match.pointsToWin}
					</div>
				`
		},
		postRender(element) {
			const match = $match.get()
			if (match?.state !== 'ongoing' || !match?.player1 || !match?.player2) {
				return
			}
			const names = { p1: match.player1.name, p2: match.player2.name }
			const scores = { p1: match.player1Score, p2: match.player2Score }
			renderer?.clear()
			renderer =
				$myRenderer.get(false) === '2D'
					? new Renderer2D(element, names, scores)
					: new Renderer3D(element, names, scores)
		},
	}
})
