import { ARENA_HEIGHT, ARENA_WIDTH } from '../../lib/engine/index.js'
import  { RENDER_SCALE } from '../components/ft-babylon.js'
import type { Vector2 } from '../../lib/engine/Vector2.js'

export function toRenderPosition(
	pos: Vector2,
	width = 0,
	height = 0,
): BABYLON.Vector3 {
	return new BABYLON.Vector3(
		scale(pos.y + height / 2 - ARENA_HEIGHT / 2), // y devient x babylon
		5,
		scale(-(pos.x + width / 2 - ARENA_WIDTH / 2)), // x devient z babylon
	)
}

export function scale(val: number): number
{
	return RENDER_SCALE * val;
}
