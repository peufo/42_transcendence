import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	BALL_BASE_SIZE,
	type Collision,
	type GameOverData,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
	type RoundData,
	type Scores,
	type State,
} from '../../lib/engine/index.js'
import { useInterpolate } from '../../lib/interpolate.js'
import { $user } from '../utils/store.js'

export type Renderer = {
	onTick: (data: State) => void
	onRoundEnd: (data: RoundData) => void
	onGameEnd: (data: GameOverData) => void
	onCollision: (data: Collision) => void
	onTimerTick: (data: number) => void
	onEngineStart: () => void
	stop: () => void
	setPlayerNames: (p1?: string | null, p2?: string | null) => void
}

type Pok = { x: number; y: number; text: string; size: number; color: string }

export function renderer2D(element: HTMLElement): Renderer {
	let animationFrameId = 0
	const interpolate = useInterpolate()
	let scores: Scores = {
		p1: 0,
		p2: 0,
	}
	let player1Name: string = 'Player 1'
	let player2Name: string = 'Player 2'
	const user = $user.get(false)
	const pokNoises: string[] = ['POK', 'PAK', 'PIK', 'PUK', 'PEK']
	const pokColors: string[] = [
		'#3FA7D6',
		'#F6D743',
		'#F45B69',
		'#9B5DE5',
		'#00BBF9',
		'#FEE440',
		'#00F5D4',
		'#FB5607',
		'#8338EC',
		'#FF006E',
	]
	const poks: Pok[] = []

	const canvas: HTMLCanvasElement = document.createElement('canvas')
	canvas.setAttribute('width', ARENA_WIDTH.toString())
	canvas.setAttribute('height', ARENA_HEIGHT.toString())
	canvas.classList.add('border')
	element.appendChild(canvas)
	const newCtx = canvas.getContext('2d')
	if (!newCtx) throw new Error('Canvas context failed')
	const ctx: CanvasRenderingContext2D = newCtx
	ctx.textAlign = 'center'

	renderWaitingFrame()
	animationFrameId = requestAnimationFrame(renderFrame)

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

	function renderGameOver() {
		ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
		const fontSize = 50
		ctx.font = `${fontSize}px sans-serif`
		ctx.fillText(
			'GAME OVER',
			ARENA_WIDTH / 2 + fontSize / 2,
			ARENA_HEIGHT / 2 - fontSize * 2,
		)
		const winner = scores.p1 > scores.p2 ? player1Name : player2Name
		ctx.fillText(
			`${winner} won !`,
			ARENA_WIDTH / 2 + fontSize / 2,
			ARENA_HEIGHT / 2 + fontSize * 2,
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
		ctx.fillStyle = user?.name === player1Name ? '#7f22fe' : '#ff2056'
		ctx.fillText(
			`${player1Name} : ${scores.p1}`,
			ARENA_WIDTH / 2 - ARENA_WIDTH / 4,
			fontSize,
		)
		ctx.fillStyle = user?.name === player2Name ? '#7f22fe' : '#ff2056'
		ctx.fillText(
			`${player2Name} : ${scores.p2}`,
			ARENA_WIDTH / 2 + ARENA_WIDTH / 4,
			fontSize,
		)
		ctx.fillStyle = 'black'
		animationFrameId = requestAnimationFrame(renderFrame)

		// poks
		poks.forEach((pok) => {
			ctx.fillStyle = pok.color
			ctx.font = `${pok.size}px sans-serif`
			ctx.fillText(pok.text, pok.x, pok.y + fontSize / 2)
		})
		ctx.fillStyle = 'black'
	}

	return {
		onTick(data: State) {
			interpolate.updateState(data)
		},
		onRoundEnd(data: RoundData) {
			scores = data.scores
		},
		onGameEnd(data: GameOverData) {
			scores = data.finalRound.scores
			cancelAnimationFrame(animationFrameId)
			renderGameOver()
		},
		onCollision(data: Collision) {
			const obj: Pok = {
				...data,
				text: pokNoises[Math.floor(Math.random() * pokNoises.length)],
				color: pokColors[Math.floor(Math.random() * pokColors.length)],
				size: Math.floor(Math.random() * (60 - 30 + 1) + 30),
			}
			poks.push(obj)
			setTimeout(() => {
				poks.shift()
			}, 1500)
		},
		onTimerTick(data: number) {
			if (data === 0) {
				animationFrameId = requestAnimationFrame(renderFrame)
			} else {
				renderTimer(data)
				cancelAnimationFrame(animationFrameId)
			}
		},
		onEngineStart() {},
		stop() {
			cancelAnimationFrame(animationFrameId)
		},
		setPlayerNames(p1?: string | null, p2?: string | null) {
			if (p1) player1Name = p1
			if (p2) player2Name = p2
		},
	}
}

// export function renderer3D(element: HTMLElement): Renderer {
// 	const interpolate = useInterpolate()
// 	let scores: Scores = {
// 		p1: 0,
// 		p2: 0,
// 	}
// 	// let player1Name: string = 'Player 1'
// 	// let player2Name: string = 'Player 2'
// 	// const user = $user.get(false)

// 	return {
// 		onTick(data: State) {
// 			interpolate.updateState(data)
// 		},
// 		onRoundEnd(data: RoundData) {
// 			scores = data.scores
// 		},
// 		onGameEnd(data: GameOverData) {
// 			scores = data.finalRound.scores
// 			// 3D game over
// 			toast.success('Game end')
// 		},
// 		onCollision(data: Collision) {},
// 		onTimerTick(data: number) {},
// 		onEngineStart() {},
// 		stop() {},
// 		// setPlayerNames(p1?: string | null, p2?: string | null) {
// 		// 	if (p1) player1Name = p1
// 		// 	if (p2) player2Name = p2
// 		// },
// 	}
// }
