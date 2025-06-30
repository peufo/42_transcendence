import {
	Engine,
	type State,
	ARENA_WIDTH,
	ARENA_HEIGHT,
} from '../../lib/engine/index.js'

customElements.define(
	'ft-pong-remote',
	class extends HTMLElement {
		canvas: HTMLCanvasElement
		ctx: CanvasRenderingContext2D
		socket: WebSocket

		constructor() {
			super()
			this.classList.add('grid', 'place-items-center')
			this.canvas = document.createElement('canvas')
			this.canvas.setAttribute('width', ARENA_WIDTH.toString())
			this.canvas.setAttribute('height', ARENA_HEIGHT.toString())
			this.canvas.classList.add('border')
			this.appendChild(this.canvas)
			const ctx = this.canvas.getContext('2d')
			if (!ctx) throw new Error('Canvas context failed')
			this.ctx = ctx
			this.ctx.textAlign = 'center'
			// websocket is still connected if pressing previous
			this.socket = new WebSocket('ws://localhost:8000/ws') // correct address
			// this.socket.addEventListener('message', async (event) => {
			// 	await new Promise((resolve) => setTimeout(resolve, 100)) // version avec latence artificielle
			// 	this.render(JSON.parse(event.data))
			// })
			this.socket.addEventListener('message', (event) => {
				this.render(JSON.parse(event.data))
			})
		}

		connectedCallback() {
			const keyHandlers: Record<string, (value: boolean) => void> = {
				w: (value) =>
					this.socket.send(
						JSON.stringify({ player: 'p1', move: 'up', value: value }),
					),
				s: (value) =>
					this.socket.send(
						JSON.stringify({ player: 'p1', move: 'down', value: value }),
					),
				i: (value) =>
					this.socket.send(
						JSON.stringify({ player: 'p2', move: 'up', value: value }),
					),
				k: (value) =>
					this.socket.send(
						JSON.stringify({ player: 'p2', move: 'down', value: value }),
					),
			}

			document.addEventListener('keydown', (event) => {
				keyHandlers[event.key]?.(true)
			})

			document.addEventListener('keyup', (event) => {
				keyHandlers[event.key]?.(false)
			})
		}

		render({ ball, paddles: { p1, p2 }, scores }: State) {
			// rendering
			this.ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

			// ball
			this.ctx.beginPath()
			this.ctx.rect(ball.position.x, ball.position.y, ball.size, ball.size)
			this.ctx.fill()

			// // paddle
			this.ctx.beginPath()
			this.ctx.rect(p1.position.x, p1.position.y, p1.width, p1.height)
			this.ctx.fill()
			this.ctx.beginPath()
			this.ctx.rect(p2.position.x, p2.position.y, p2.width, p2.height)
			this.ctx.fill()

			const str = `Player 1: ${scores.p1} | Player 2: ${scores.p2}`
			this.ctx.fillText(str, ARENA_WIDTH / 2, 10)
		}
	},
)
