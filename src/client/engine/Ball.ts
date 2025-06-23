import { Vector2 } from './Vector2.js'
import { Paddle } from './Paddle.js'
import { can, ctx, paddles, scorePoint } from './index.js'

export class Ball {
	#speed = 0.35 // const initial speed
	#position: Vector2
	#size: number
	#velocity = new Vector2(1, 0.2) // randomize initial dir

	get size() {
		return this.#size
	}

	get position() {
		return this.#position
	}

	constructor(position: Vector2, size: number) {
		this.#position = new Vector2(position.x, position.y)
		this.#size = size
	}

	bounceWall() {}

	#bouncePaddle(paddle: Paddle) {
		const relativeInsersectY =
			paddle.position.y + paddle.height / 2 - (this.#position.y + this.size / 2)
		const normalizedRelativeInsersectionY =
			relativeInsersectY / (paddle.height / 2)
		this.#speed *= 1.07 // const speed ramp ?
		const bounceAngle = normalizedRelativeInsersectionY * ((4 * Math.PI) / 12) // MAXBOUNCEANGLE const ?
		const vSign = Math.sign(this.#velocity.x)
		this.#velocity.x = Math.cos(bounceAngle)
		this.#velocity.y = -Math.sin(bounceAngle)
		this.#velocity.x *= -vSign
	}

	paddleCollision(paddle: Paddle): boolean {
		if (
			this.position.x + this.#size >= paddle.position.x &&
			this.position.x <= paddle.position.x + paddle.width &&
			this.position.y + this.size >= paddle.position.y &&
			this.position.y <= paddle.position.y + paddle.height
		)
			return true
		return false
	}

	wallCollision() {
		if (this.#position.y <= 0 || this.#position.y + this.#size >= can.height)
			this.#velocity.y = -this.#velocity.y
		else if (this.#position.x <= 0) scorePoint('p2')
		else if (this.#position.x + this.#size >= can.width) scorePoint('p1')
	}

	#handleCollisions() {
		if (this.paddleCollision(paddles.p1)) this.#bouncePaddle(paddles.p1)
		else if (this.paddleCollision(paddles.p2)) this.#bouncePaddle(paddles.p2)
		this.wallCollision()
	}

	update(delta: number) {
		this.#handleCollisions()
		this.#velocity.normalize()
		this.position.x += this.#velocity.x * delta * this.#speed
		this.position.y += this.#velocity.y * delta * this.#speed
	}

	draw() {
		ctx?.beginPath()
		ctx?.rect(this.position.x, this.position.y, this.#size, this.#size)
		ctx?.fill()
	}
}
