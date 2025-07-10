import { cubicOut } from '../easing.js'
import { getRandomArbitrary } from '../utils.js'
import type { Paddle } from './Paddle.js'
import { Vector2 } from './Vector2.js'
import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	BALL_BASE_SIZE,
	BALL_BASE_SPEED,
	BALL_MAX_BOUNCE_ANGLE,
	BALL_MAX_SPEED,
	BALL_SUBSTEPS,
	BALL_TIME_TO_REACH_MAX_SPEED,
	type Engine,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_WIDTH,
	type Player,
	TICK_INTERVAL,
} from './index.js'

export class Ball {
	#speed = BALL_BASE_SPEED
	#position: Vector2
	#velocity = new Vector2(
		Math.random() < 0.5 ? 1 : -1,
		getRandomArbitrary(-0.3, 0.3),
	)
	#engine: Engine

	get position() {
		return this.#position
	}

	get velocity() {
		return this.#velocity
	}

	constructor(position: Vector2, engine: Engine) {
		this.#engine = engine
		this.#position = new Vector2(position.x, position.y)
	}

	#handleVerticalWallCollision(): boolean {
		if (this.#position.y <= 0) {
			this.#position.y = 0
			this.#velocity.y = -this.#velocity.y
			return true
		}
		if (this.#position.y + BALL_BASE_SIZE >= ARENA_HEIGHT) {
			this.#position.y = ARENA_HEIGHT - BALL_BASE_SIZE
			this.#velocity.y = -this.#velocity.y
			return true
		}
		return false
	}

	#isCollidingWithPaddle(paddle: Paddle): boolean {
		if (
			this.#position.x + BALL_BASE_SIZE >= paddle.position.x &&
			this.#position.x <= paddle.position.x + PADDLE_BASE_WIDTH &&
			this.#position.y + BALL_BASE_SIZE >= paddle.position.y &&
			this.#position.y <= paddle.position.y + PADDLE_BASE_HEIGHT
		)
			return true
		return false
	}

	#bouncePaddle(paddle: Paddle) {
		const relativeInsersectY =
			paddle.position.y +
			PADDLE_BASE_HEIGHT / 2 -
			(this.#position.y + BALL_BASE_SIZE / 2)
		const normalizedRelativeInsersectionY =
			relativeInsersectY / (PADDLE_BASE_HEIGHT / 2)
		const bounceAngle = normalizedRelativeInsersectionY * BALL_MAX_BOUNCE_ANGLE
		const vSign = Math.sign(this.#velocity.x)
		this.#velocity.x = Math.cos(bounceAngle)
		this.#velocity.y = -Math.sin(bounceAngle)
		this.#velocity.x *= -vSign
		if (this.#speed !== BALL_MAX_SPEED) {
			const t =
				(Date.now() - this.#engine.roundStartTime) /
				BALL_TIME_TO_REACH_MAX_SPEED
			if (t <= 1)
				this.#speed =
					BALL_BASE_SPEED + (BALL_MAX_SPEED - BALL_BASE_SPEED) * cubicOut(t)
			else this.#speed = BALL_MAX_SPEED
		}
	}

	#handlePaddlesCollisions(): boolean {
		const { paddles } = this.#engine
		if (this.#isCollidingWithPaddle(paddles.p1)) {
			this.#position.x = paddles.p1.position.x + PADDLE_BASE_WIDTH
			this.#bouncePaddle(paddles.p1)
			return true
		}
		if (this.#isCollidingWithPaddle(paddles.p2)) {
			this.#position.x = paddles.p2.position.x - BALL_BASE_SIZE
			this.#bouncePaddle(paddles.p2)
			return true
		}
		return false
	}

	#playerScoring(): Player | null {
		const outOfBoundsOffset = BALL_BASE_SIZE * 3
		if (this.#position.x <= -outOfBoundsOffset) {
			return 'p2' // left side
		}
		if (this.#position.x + BALL_BASE_SIZE >= ARENA_WIDTH + outOfBoundsOffset) {
			return 'p1' // right side
		}
		return null
	}

	update(): Player | null {
		for (let i = 0; i < BALL_SUBSTEPS; i++) {
			this.#velocity.normalize()
			this.#position.x +=
				this.#velocity.x * (TICK_INTERVAL / BALL_SUBSTEPS) * this.#speed
			this.#position.y +=
				this.#velocity.y * (TICK_INTERVAL / BALL_SUBSTEPS) * this.#speed
			if (
				this.#handlePaddlesCollisions() ||
				this.#handleVerticalWallCollision()
			)
				return null
		}
		return this.#playerScoring()
	}
}
