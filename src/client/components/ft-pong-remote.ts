import type { Move, Player } from '../../lib/engine/index.js'
import type { ChannelSocket } from '../../lib/useSocketChannels.js'
import type { Renderer } from '../renderer/Renderer.js'
import { Renderer2D } from '../renderer/Renderer2D.js'
import { Renderer3D } from '../renderer/Renderer3D.js'
import { socketChannel } from '../socketChannel.js'
import { defineComponent } from '../utils/component.js'
import { $match, $user } from '../utils/store.js'
import { toast } from './ft-toast.js'

defineComponent('ft-pong-remote', () => {
	let channel: ChannelSocket<'matches'>
	let cleanInputs: (() => void) | undefined
	let renderer: Renderer

	function setupInputs(player: Player) {
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

	const setup = (element: HTMLElement) => {
		const user = $user.get()
		const match = $match.get()
		if (!user) {
			element.innerHTML = /*html*/ `No user found`
			return
		}
		if (!match) {
			element.innerHTML = /*html*/ `
				<div class="h-[100%] w-[100%] flex flex-row items-center justify-center">
					You don't have any match.
				</div>
				`
			return
		}
		channel?.close()
		channel = socketChannel(
			'matches',
			{ matchId: match.id.toString() },
			{
				matchReady: (names) => {
					renderer?.clear()
					renderer = new Renderer3D(element, names)
				},
				onEngineEvent: (data) => {
					renderer.onEngineEvent(data)
					if (data.onGameEnd !== undefined) {
						toast.success('Game end')
					}
					if (data.onEngineStart !== undefined) {
						toast.success('Game start')
					}
				},
			},
		)

		const player: Player = user.id === match.player1Id ? 'p1' : 'p2'
		cleanInputs?.()
		cleanInputs = setupInputs(player)
	}

	return {
		onDestroy() {
			cleanInputs?.()
			channel?.close()
		},
		postRender(element) {
			setup(element)
		},
	}
})
