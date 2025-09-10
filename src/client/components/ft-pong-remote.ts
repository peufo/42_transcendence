import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	BALL_BASE_SIZE,
	type Move,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type Player,
	type Scores,
} from '../../lib/engine/index.js'
import { useInterpolate } from '../../lib/interpolate.js'
import type { Match, UserWithTournament } from '../../lib/type.js'
import type { ChannelSocket } from '../../lib/useSocketChannels.js'
import { socketChannel } from '../socketChannel.js'
import { defineComponent } from '../utils/component.js'
import { $match, $user } from '../utils/store.js'
import { toast } from './ft-toast.js'

defineComponent('ft-pong-remote', () => {
	let animationFrameId = 0
	let user: UserWithTournament | undefined
	let match: Match | undefined
	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D
	let channel: ChannelSocket<'matches'>
	const interpolate = useInterpolate()
	let scores: Scores = {
		p1: 0,
		p2: 0,
	}
	let cleanHandle: (() => void) | undefined

	function initCanvas(element: HTMLElement) {
		if (!canvas) {
			canvas = document.createElement('canvas')
			canvas.setAttribute('width', ARENA_WIDTH.toString())
			canvas.setAttribute('height', ARENA_HEIGHT.toString())
			canvas.classList.add('border')
			element.appendChild(canvas)
			const newCtx = canvas.getContext('2d')
			if (!newCtx) throw new Error('Canvas context failed')
			ctx = newCtx
			ctx.textAlign = 'center'
		}
		renderWaitingFrame()
	}

	function renderWaitingFrame() {
		ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
		const fontSize = 50
		ctx.font = `${fontSize}px sans-serif`
		ctx.fillText(
			'Waiting on player',
			ARENA_WIDTH / 2 + fontSize / 2,
			ARENA_HEIGHT / 2,
		)
	}

	function renderTimer(timer: number) {
		ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
		const fontSize = 50
		ctx.font = `${fontSize}px sans-serif`
		ctx.fillText(
			timer.toString(),
			ARENA_WIDTH / 2 + fontSize / 2,
			ARENA_HEIGHT / 2,
		)
	}

	function renderFrame() {
		ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
		const state = interpolate.getState()
		// ball
		ctx.beginPath()
		ctx.rect(state.b.x, state.b.y, BALL_BASE_SIZE, BALL_BASE_SIZE)
		ctx.fill()

		// paddle
		ctx.beginPath()
		ctx.rect(
			PADDLE_BASE_P1_POSITION.x,
			state.p1,
			PADDLE_BASE_WIDTH,
			PADDLE_BASE_HEIGHT,
		)
		ctx.fill()
		ctx.beginPath()
		ctx.rect(
			PADDLE_BASE_P2_POSITION.x,
			state.p2,
			PADDLE_BASE_WIDTH,
			PADDLE_BASE_HEIGHT,
		)
		ctx.fill()

		// scores
		const fontSize = 40
		ctx.font = `${fontSize}px sans-serif`
		ctx.fillStyle = user?.id === match?.player1Id ? '#7f22fe' : '#ff2056'
		ctx.fillText(
			`${match?.player1?.name} : ${scores.p1}`,
			ARENA_WIDTH / 2 - ARENA_WIDTH / 4,
			fontSize,
		)
		ctx.fillStyle = user?.id === match?.player2Id ? '#7f22fe' : '#ff2056'
		ctx.fillText(
			`${match?.player2?.name} : ${scores.p2}`,
			ARENA_WIDTH / 2 + ARENA_WIDTH / 4,
			fontSize,
		)
		ctx.fillStyle = 'black'
		animationFrameId = requestAnimationFrame(renderFrame)
	}

	function handle(element: HTMLElement) {
		console.log('POST RENDER PONG REMOTE')
		user = $user.get()
		match = $match.get()
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
		initCanvas(element) // TODO: use babylon
		channel = socketChannel(
			'matches',
			{ matchId: match.id.toString() },
			{
				onEngineEvent: (data) => {
					console.log(data)
					if (data.onTimerTick !== undefined) {
						if (data.onTimerTick === 0) {
							animationFrameId = requestAnimationFrame(renderFrame)
						} else {
							renderTimer(data.onTimerTick)
							cancelAnimationFrame(animationFrameId)
						}
					}
					if (data.onTick) {
						interpolate.updateState(data.onTick)
					}
					if (data.onRoundEnd) {
						scores = data.onRoundEnd.scores
					}
					if (data.onGameEnd) {
						scores = data.onGameEnd.finalRound.scores
						toast.success('Game end')
					}
					if (data.onStart !== undefined) {
						toast.success('Game start')
					}
				},
			},
		)

		const player: Player = user.id === match.player1Id ? 'p1' : 'p2'

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

		const onKeydown = (event: KeyboardEvent) => {
			keyHandlers[event.key]?.(true)
		}
		const onKeyup = (event: KeyboardEvent) => {
			keyHandlers[event.key]?.(false)
		}

		document.addEventListener('keydown', onKeydown)
		document.addEventListener('keyup', onKeyup)

		return () => {
			document.removeEventListener('keydown', onKeydown)
			document.removeEventListener('keyup', onKeyup)
			return
		}
	}

	return {
		onDestroy() {
			cleanHandle?.()
			channel?.close()
		},
		postRender(element) {
			cleanHandle = handle(element)
		},
	}
})
