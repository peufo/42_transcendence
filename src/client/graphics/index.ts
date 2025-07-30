// graphics/index.ts
export * from './arena.js'
export * from './ball.js'
export * from './camera.js'
export * from './collisions.js'
export * from './effects.js'
export * from './environment.js'
export * from './lights.js'
export * from './materials.js'
export * from './paddles.js'
export * from './scene.js'
export * from './shadows.js'
export * from './utils.js'

import { ARENA_HEIGHT, ARENA_WIDTH } from '../../lib/engine/index.js'
import { createArena } from './arena.js'
import { createBall } from './ball.js'
import {
	createBallMaterial,
	createPaddleMaterial,
	createWallMaterial,
} from './materials.js'
import { createPaddles } from './paddles.js'
export async function createGameObjects(scene: BABYLON.Scene): Promise<{
	ballMesh: BABYLON.Mesh
	paddle1: BABYLON.AbstractMesh
	paddle2: BABYLON.AbstractMesh
}> {
	const wallMaterial = createWallMaterial(scene)
	const paddleMaterial = createPaddleMaterial(scene)
	const ballMaterial = createBallMaterial(scene)

	createArena(scene, wallMaterial, ARENA_WIDTH, ARENA_HEIGHT)
	const paddles = await createPaddles(scene, paddleMaterial)
	const ballMesh = createBall(scene, ballMaterial)

	/*
    // Apply highlights
    setupHighlightEffects(scene, [
        ballMesh,
        scene.getMeshByName('wall')!,
        scene.getMeshByName('wall2')!,
        scene.getMeshByName('wall3')!,
        scene.getMeshByName('wall4')!,
    ])
	*/
	return { ballMesh, paddle1: paddles.paddle1, paddle2: paddles.paddle2 }
}
