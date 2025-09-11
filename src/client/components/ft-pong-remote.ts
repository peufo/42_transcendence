import type { Move, Player } from '../../lib/engine/index.js'
import type { ChannelSocket } from '../../lib/useSocketChannels.js'
import { socketChannel } from '../socketChannel.js'
import { defineComponent } from '../utils/component.js'
import { type Renderer, renderer2D } from '../utils/renderer.js'
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

	function handle(element: HTMLElement) {
		console.log('POST RENDER PONG REMOTE')
		const user = $user.get()
		const match = $match.get()
		if (!user) {
			element.innerHTML = /*html*/ `
					No user found
					`
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
		channel = socketChannel(
			'matches',
			{ matchId: match.id.toString() },
			{
				playerNames: (names) => {
					renderer.setPlayerNames(names)
				},
				onEngineEvent: (data) => {
					if (data.onTimerTick !== undefined) {
						renderer.onTimerTick(data.onTimerTick)
					}
					if (data.onTick !== undefined) {
						renderer.onTick(data.onTick)
					}
					if (data.onRoundEnd !== undefined) {
						renderer.onRoundEnd(data.onRoundEnd)
					}
					if (data.onGameEnd !== undefined) {
						renderer.onGameEnd(data.onGameEnd)
						toast.success('Game end')
					}
					if (data.onEngineStart !== undefined) {
						renderer.onEngineStart()
						toast.success('Game start')
					}
					if (data.onCollision !== undefined) {
						renderer.onCollision(data.onCollision)
					}
				},
			},
		)

		const player: Player = user.id === match.player1Id ? 'p1' : 'p2'
		cleanInputs = setupInputs(player)
	}

	return {
		onLoad(element) {
			renderer = renderer2D(element)
		},
		onDestroy() {
			cleanInputs?.()
			channel?.close()
		},
		postRender(element) {
			handle(element)
		},
	}
})
