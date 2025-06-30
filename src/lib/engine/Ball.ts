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
	BALL_MAX_SPEED,
	BALL_TIME_TO_REACH_MAX_SPEED,
	BALL_SUBSTEPS,
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
		if (this.#speed !== BALL_MAX_SPEED) {
			const t =
				(Date.now() - this.#engine.startTime) / BALL_TIME_TO_REACH_MAX_SPEED
			if (t <= 1)
				this.#speed =
					BALL_BASE_SPEED + (BALL_MAX_SPEED - BALL_BASE_SPEED) * cubicOut(t)
			else this.#speed = BALL_MAX_SPEED
		}
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

	toJSON() {
		return {
			position: this.#position,
			size: this.#size,
		}
	}

	playerScoring(): Player | null {
		if (this.#position.x <= 0) {
			return 'p2' // left side
		}
		if (this.#position.x + this.#size >= ARENA_WIDTH) {
			return 'p1' // right side
		}
		return null
	}

	update() {
		for (let i = 0; i < BALL_SUBSTEPS; i++) {
			this.#velocity.normalize()
			this.#position.x +=
				((this.#velocity.x * TICK_INTERVAL) / BALL_SUBSTEPS) * this.#speed
			this.#position.y +=
				((this.#velocity.y * TICK_INTERVAL) / BALL_SUBSTEPS) * this.#speed
			this.#handleCollisions()
		}
	}
}
