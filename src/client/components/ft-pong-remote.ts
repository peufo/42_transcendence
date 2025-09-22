import type { Move, Player } from '../../lib/engine/index.js'
import type { Match } from '../../lib/type.js'
import type { ChannelSocket } from '../../lib/useSocketChannels.js'
import type { Renderer } from '../renderer/Renderer.js'
import { Renderer2D } from '../renderer/Renderer2D.js'
import { Renderer3D } from '../renderer/Renderer3D.js'
import { socketChannel } from '../socketChannel.js'
import { defineComponent } from '../utils/component.js'
import { createSignal } from '../utils/signal.js'
import {
	$matchId,
	$matchState,
	$myRenderer,
	$user,
	matchMap,
} from '../utils/store.js'
import { toast } from './ft-toast.js'

defineComponent('ft-pong-remote', () => {
	return {
		onLoad(element) {
			element.classList.add('col-span-3', 'flex', 'flex-row', 'justify-center')
		},
		render() {
			console.log('render ft-pong-remote')
			const matchId = $matchId.get()
			$myRenderer.get()

			if (!matchId) {
				return /*html*/ `
					<div class="h-[100%] w-[100%] flex flex-row items-center justify-center">
						You don't have any match.
					</div>
				`
			}
			return /*html*/ `
				<ft-pong-remote-render match-id="${matchId}" class="flex flex-col items-center"></ft-pong-remote-render>
			`
		},
	}
})

defineComponent('ft-pong-remote-render', () => {
	let renderer: Renderer
	let cleanup: (() => void) | undefined
	const isConnected = createSignal<boolean>(false)
	let matchId: number

	const renderAwaiting = (match: Match) => {
		const connectBtn = /*html*/ `
			<button id="connect-btn" class="btn btn-primary flex flex-row justify-center items-center mt-4">Connect</button>
		`

		const waiting = /*html*/ `
			<div class="flex flex-row justify-center items-center animate-bounce font-bold w-full">
				Waiting for player
			</div>
		`

		const infos = /*html*/ `
			<div class="flex flex-row justify-center items-center w-full">${match.player1?.name} (left) VS ${match.player2?.name} (right)</div>
			<div class="flex flex-row justify-center items-center w-full">Points required to win the match: ${match.pointsToWin}</div>
		`

		return /*html*/ `
			${infos}
			${isConnected.get() ? waiting : connectBtn}
		`
	}

	function connectChannel() {
		const user = $user.get(false)
		const match = matchMap.get(matchId)?.get(false)
		if (!match || !user) return
		isConnected.set(true)
		const player: Player = user.id === match.player1Id ? 'p1' : 'p2'

		const channel = socketChannel(
			'matches',
			{ matchId: match.id.toString() },
			{
				onEngineEvent: (data) => {
					if (data.onGameEnd !== undefined) {
						toast.success('Game end')
					}
					renderer.onEngineEvent(data)
				},
			},
		)

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

		const cleanInputs = setupInputs(player, channel)
		return () => {
			cleanInputs()
			channel.close()
		}
	}

	return {
		onLoad(element) {
			matchId = +(element.getAttribute('match-id') ?? -1)
			if (matchId === -1) {
				throw new Error('match-id attribute required in ft-pong-remote-render')
			}
		},
		onDestroy() {
			if (cleanup) cleanup()
		},
		render() {
			console.log('render ft-pong-remote-render')
			const matchState = $matchState.get()
			const match = matchMap.get(matchId)?.get(false)
			if (!match) throw new Error('matchId should find match in matchMap')

			if (matchState === 'awaiting') {
				return renderAwaiting(match)
			}
			if (matchState === 'finished') {
				return /*html*/ `
					<div class="h-[100%] w-[100%] flex flex-row items-center justify-center">
						Game over, ${match.player1Score > match.player2Score ? match.player1?.name : match.player2?.name} won
					</div>
				`
			}
			return ''
		},
		postRender(element) {
			const matchState = $matchState.get()
			const match = matchMap.get(matchId)?.get(false)
			if (!match) throw new Error('matchId should find match in matchMap')

			const connectBtn =
				element.querySelector<HTMLButtonElement>('#connect-btn')
			if (connectBtn) {
				connectBtn.addEventListener('click', () => {
					cleanup = connectChannel()
				})
			}

			if (matchState !== 'ongoing' || !match?.player1 || !match?.player2) {
				return
			}
			const names = { p1: match.player1.name, p2: match.player2.name }
			const scores = { p1: match.player1Score, p2: match.player2Score }
			if (!isConnected.get(false)) connectChannel()
			renderer?.clear()
			renderer =
				$myRenderer.get(false) === '2D'
					? new Renderer2D(element, names, scores)
					: new Renderer3D(element, names, scores)
		},
	}
})
