import { Vector2 } from './Vector2.js'
import { Paddle } from './Paddle.js'
import { ballMaxBounceAngle, ballSpeedRamp, baseBallSpeed, can, ctx, paddles, scorePoint } from './index.js'

export class Ball {
	#speed = baseBallSpeed;
	#position: Vector2
	#size: number
	#velocity = new Vector2(Math.random() < 0.5 ? 1 : -1, 0)

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

	bounceWall() { }

	#bouncePaddle(paddle: Paddle) {
		const relativeInsersectY =
			paddle.position.y + paddle.height / 2 - (this.#position.y + this.size / 2)
		const normalizedRelativeInsersectionY =
			relativeInsersectY / (paddle.height / 2)
		this.#speed *= ballSpeedRamp;
		const bounceAngle = normalizedRelativeInsersectionY * ballMaxBounceAngle;
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
		if (this.#position.y <= 0) {
			this.#position.y = 0;
			this.#velocity.y = -this.#velocity.y;
		}
		else if (this.#position.y + this.#size >= can.height) {
			this.#position.y = can.height - this.#size;
			this.#velocity.y = -this.#velocity.y;
		}
		else if (this.#position.x <= 0) scorePoint('p2')
		else if (this.#position.x + this.#size >= can.width) scorePoint('p1')
	}

	#handleCollisions() {
		if (this.paddleCollision(paddles.p1)) {
			this.#position.x = paddles.p1?.position.x + paddles.p1?.width;
			this.#bouncePaddle(paddles.p1)
		}
		else if (this.paddleCollision(paddles.p2)) {
			this.#position.x = paddles.p2?.position.x - this.#size;
			this.#bouncePaddle(paddles.p2)
		}
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
