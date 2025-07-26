import { cubicOut } from '../easing.js'
import { getRandomArbitrary } from '../utils.js'
import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	BALL_BASE_SIZE,
	BALL_BASE_SPEED,
	BALL_MAX_BOUNCE_ANGLE,
	BALL_MAX_SPEED,
	BALL_SUBSTEPS,
	BALL_TIME_TO_REACH_MAX_SPEED,
	COLLISION_TYPE,
	type Engine,
	EVENT_TYPE,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_WIDTH,
	type Player,
	type Round,
	TICK_INTERVAL,
} from './index.js'
import type { Paddle } from './Paddle.js'
import { Vector2 } from './Vector2.js'

export class Ball {
	#speed = BALL_BASE_SPEED
	#position: Vector2
	#velocity = new Vector2(
		Math.random() < 0.5 ? 1 : -1,
		getRandomArbitrary(-0.3, 0.3),
	)
	#engine: Engine
	#rallyCount: number
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
			this.#engine.onEvent(EVENT_TYPE.COLLISION, {
				type: COLLISION_TYPE.WALL_TOP,
				x: this.#position.x + BALL_BASE_SIZE / 2,
				y: 0,
			})
			return true
		}
		if (this.#position.y + BALL_BASE_SIZE >= ARENA_HEIGHT) {
			this.#position.y = ARENA_HEIGHT - BALL_BASE_SIZE
			this.#velocity.y = -this.#velocity.y
			this.#engine.onEvent(EVENT_TYPE.COLLISION, {
				type: COLLISION_TYPE.WALL_BOTTOM,
				x: this.#position.x + BALL_BASE_SIZE / 2,
				y: ARENA_HEIGHT,
			})
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
		) {
			return true
		}
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
			this.#engine.onEvent(EVENT_TYPE.COLLISION, {
				type: COLLISION_TYPE.PADDLE_P1,
				x: this.position.x,
				y: this.position.y + BALL_BASE_SIZE / 2,
			})
		}
		if (this.#isCollidingWithPaddle(paddles.p2)) {
			this.#position.x = paddles.p2.position.x - BALL_BASE_SIZE
			this.#bouncePaddle(paddles.p2)
			this.#engine.onEvent(EVENT_TYPE.COLLISION, {
				type: COLLISION_TYPE.PADDLE_P2,
				x: this.position.x + BALL_BASE_SIZE,
				y: this.position.y + BALL_BASE_SIZE / 2,
			})
			return true
		}
		return false
	}

	#checkPlayerScoring(): Round | null {
		const outOfBoundsOffset = BALL_BASE_SIZE * 3
		if (this.#position.x <= -outOfBoundsOffset) {
			return this.#createRoundEnd('p2')
		}
		if (this.#position.x + BALL_BASE_SIZE >= ARENA_WIDTH + outOfBoundsOffset) {
			return this.#createRoundEnd('p1')
		}
		return null
	}

	#createRoundEnd(scorer: Player): Round {
		return {
			scorer,
			rallyCount: this.#rallyCount,
			ballPositionY: this.position.y,
		}
	}
	update(): Round | null {
		for (let i = 0; i < BALL_SUBSTEPS; i++) {
			this.#velocity.normalize()
			this.#position.x +=
				this.#velocity.x * (TICK_INTERVAL / BALL_SUBSTEPS) * this.#speed
			this.#position.y +=
				this.#velocity.y * (TICK_INTERVAL / BALL_SUBSTEPS) * this.#speed
			if (this.#handlePaddlesCollisions()) {
				this.#rallyCount++
				return null
			}
			if (this.#handleVerticalWallCollision()) {
				return null
			}
		}
		this.#rallyCount = 0
		return this.#checkPlayerScoring()
	}
}
