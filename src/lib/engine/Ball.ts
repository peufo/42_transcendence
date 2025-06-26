import { Vector2 } from './Vector2.js'
import type { Paddle } from './Paddle.js'
import {
	BALL_MAX_BOUNCE_ANGLE,
	BALL_BASE_SPEED,
	ARENA_HEIGHT,
	ARENA_WIDTH,
	TICK_INTERVAL,
	type Player,
	type Engine,
} from './index.js'
import { cubicOut } from '../easing.js'

export class Ball {
	#speed = BALL_BASE_SPEED
	#position: Vector2
	#size: number
	#velocity = new Vector2(Math.random() < 0.5 ? 1 : -1, 0)
	#engine: Engine

	get size() {
		return this.#size
	}

	get position() {
		return this.#position
	}

	constructor(position: Vector2, size: number, engine: Engine) {
		this.#engine = engine
		this.#position = new Vector2(position.x, position.y)
		this.#size = size
	}

	#bouncePaddle(paddle: Paddle) {
		const relativeInsersectY =
			paddle.position.y +
			paddle.height / 2 -
			(this.#position.y + this.#size / 2)
		const normalizedRelativeInsersectionY =
			relativeInsersectY / (paddle.height / 2)
		const bounceAngle = normalizedRelativeInsersectionY * BALL_MAX_BOUNCE_ANGLE
		const vSign = Math.sign(this.#velocity.x)
		this.#velocity.x = Math.cos(bounceAngle)
		this.#velocity.y = -Math.sin(bounceAngle)
		this.#velocity.x *= -vSign
		const t = (Date.now() - this.#engine.startTime) / 60000
		const ADD_SPEED = 0.8
		if (t <= 1) this.#speed = BALL_BASE_SPEED + ADD_SPEED * cubicOut(t)
		console.log({ t, speed: this.#speed })
	}

	#paddleCollision(paddle: Paddle): boolean {
		if (
			this.#position.x + this.#size >= paddle.position.x &&
			this.#position.x <= paddle.position.x + paddle.width &&
			this.#position.y + this.#size >= paddle.position.y &&
			this.#position.y <= paddle.position.y + paddle.height
		)
			return true
		return false
	}

	#verticalWallCollision() {
		if (this.#position.y <= 0) {
			this.#position.y = 0
			this.#velocity.y = -this.#velocity.y
		} else if (this.#position.y + this.#size >= ARENA_HEIGHT) {
			this.#position.y = ARENA_HEIGHT - this.#size
			this.#velocity.y = -this.#velocity.y
		}
	}

	#handleCollisions() {
		const { paddles } = this.#engine
		if (this.#paddleCollision(paddles.p1)) {
			this.#position.x = paddles.p1.position.x + paddles.p1?.width
			this.#bouncePaddle(paddles.p1)
		} else if (this.#paddleCollision(paddles.p2)) {
			this.#position.x = paddles.p2?.position.x - this.#size
			this.#bouncePaddle(paddles.p2)
		}
		this.#verticalWallCollision()
	}

	playerScoring(): Player | null {
		const { paddles } = this.#engine
		if (this.#position.x <= 0) {
			if (
				this.#position.y + this.#size >= paddles.p1.position.y &&
				this.#position.y <= paddles.p1.position.y + paddles.p1.height
			) {
				this.#bouncePaddle(paddles.p1)
				return null
			}
			return 'p2' // left side
		}
		if (this.#position.x + this.#size >= ARENA_WIDTH) {
			if (
				this.#position.y + this.#size >= paddles.p2.position.y &&
				this.#position.y <= paddles.p2.position.y + paddles.p2.height
			) {
				this.#bouncePaddle(paddles.p2)
				return null
			}
			return 'p1' // right side
		}
		return null
	}

	update() {
		this.#handleCollisions()
		this.#velocity.normalize()
		this.#position.x += this.#velocity.x * TICK_INTERVAL * this.#speed
		this.#position.y += this.#velocity.y * TICK_INTERVAL * this.#speed
	}
}
