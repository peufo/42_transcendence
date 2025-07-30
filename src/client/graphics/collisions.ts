import type { Collision } from '../../lib/engine/index.js'
import { Vector2 } from '../../lib/engine/Vector2.js'
import { toRenderPosition } from './utils.js'

export function handleCollision(
	collision: Collision,
	ballMesh: BABYLON.Mesh,
	_paddle1: BABYLON.AbstractMesh,
	_paddle2: BABYLON.AbstractMesh,
	scene: BABYLON.Scene,
	_camera: BABYLON.ArcRotateCamera,
	_wallParticleSystem: BABYLON.ParticleSystem,
): void {
	const impactPos = toRenderPosition(new Vector2(collision.x, collision.y))

	const bounceAnim = new BABYLON.Animation(
		'bounce',
		'scaling',
		0,
		BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
	)
	bounceAnim.setKeys([
		{ frame: 0, value: ballMesh.scaling },
		{ frame: 5, value: ballMesh.scaling.scale(2) },
		{ frame: 10, value: ballMesh.scaling },
	])
	ballMesh.animations = [bounceAnim]
	scene.beginAnimation(ballMesh, 0, 10, false)

	if (collision.type.startsWith('wall_')) {
		triggerWallRebound(impactPos, scene, collision.type)
	} else if (collision.type.startsWith('goal')) {
		triggerGoalExplosion(impactPos, scene)
	} else if (collision.type.startsWith('paddle_')) {
		triggerPaddleHit()
	}
}

function triggerWallRebound(
	position: BABYLON.Vector3,
	scene: BABYLON.Scene,
	collisionType: string,
): void {
	const impactIndicator = BABYLON.MeshBuilder.CreateDisc(
		'impactIndicator',
		{ radius: 1.5, tessellation: 32 },
		scene,
	)
	impactIndicator.position = position

	if (collisionType === 'wall_top') {
		impactIndicator.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0)
		impactIndicator.position.x += 0.5
		impactIndicator.position.y += 0.65
	} else if (collisionType === 'wall_bottom') {
		impactIndicator.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0)
		impactIndicator.position.x -= 0.5
		impactIndicator.position.y += 0.65
	}

	impactIndicator.isPickable = false
	impactIndicator.checkCollisions = false
	impactIndicator.material = createImpactMaterial(scene, collisionType)

	const glow = scene.getGlowLayerByName('glow')
	if (glow) glow.addIncludedOnlyMesh(impactIndicator)

	const impactAnim = new BABYLON.Animation(
		'impactAnim',
		'scaling',
		30,
		BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
		BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
	)
	impactAnim.setKeys([
		{ frame: 0, value: new BABYLON.Vector3(0.2, 0.2, 0.2) },
		{ frame: 10, value: new BABYLON.Vector3(1.2, 1.2, 1.2) },
		{ frame: 15, value: new BABYLON.Vector3(1.0, 1.0, 1.0) },
		{ frame: 20, value: new BABYLON.Vector3(1.3, 1.3, 1.3) },
	])

	const alphaAnim = new BABYLON.Animation(
		'alphaAnim',
		'material.alpha',
		30,
		BABYLON.Animation.ANIMATIONTYPE_FLOAT,
		BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
	)
	alphaAnim.setKeys([
		{ frame: 0, value: 0.9 },
		{ frame: 10, value: 0.9 },
		{ frame: 20, value: 0 },
	])

	// Animation de couleur
	const colorAnim = new BABYLON.Animation(
		'colorAnim',
		'material.emissiveColor',
		30,
		BABYLON.Animation.ANIMATIONTYPE_COLOR3,
		BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
	)
	const startColor =
		collisionType === 'wall_top'
			? new BABYLON.Color3(0.2, 0.8, 1.0)
			: new BABYLON.Color3(1.0, 0.5, 0.2)
	colorAnim.setKeys([
		{ frame: 0, value: startColor },
		{ frame: 10, value: new BABYLON.Color3(1.0, 1.0, 1.0) },
		{ frame: 20, value: startColor.scale(0.5) },
	])

	impactIndicator.animations = [impactAnim, alphaAnim, colorAnim]
	scene.beginAnimation(impactIndicator, 0, 20, false, 1, () => {
		if (glow) glow.removeIncludedOnlyMesh(impactIndicator)
		impactIndicator.dispose()
	})

	flashScreen(scene, startColor, 0.4, 200)
}

function createImpactMaterial(
	scene: BABYLON.Scene,
	collisionType: string,
): BABYLON.StandardMaterial {
	const impactMaterial = new BABYLON.StandardMaterial('impactMaterial', scene)
	const startColor =
		collisionType === 'wall_top'
			? new BABYLON.Color3(0.2, 0.8, 1.0)
			: new BABYLON.Color3(1.0, 0.5, 0.2)
	impactMaterial.emissiveColor = startColor
	impactMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
	impactMaterial.alpha = 0.9
	impactMaterial.emissiveTexture = new BABYLON.Texture(
		'https://assets.babylonjs.com/textures/flare.png',
		scene,
	)
	impactMaterial.backFaceCulling = false
	return impactMaterial
}

function triggerGoalExplosion(
	position: BABYLON.Vector3,
	scene: BABYLON.Scene,
): void {
	const explosion = new BABYLON.ParticleSystem('goalExplosion', 2000, scene)
	explosion.emitter = position
	explosion.particleTexture = new BABYLON.Texture(
		'https://assets.babylonjs.com/textures/flare.png',
	)
	explosion.minSize = 10
	explosion.maxSize = 30
	explosion.minLifeTime = 0.5
	explosion.maxLifeTime = 1.5
	explosion.emitRate = 1000
	explosion.color1 = new BABYLON.Color4(1, 0.2, 0, 1)
	explosion.color2 = new BABYLON.Color4(1, 1, 0, 0.5)
	explosion.direction1 = new BABYLON.Vector3(-2, -2, -2)
	explosion.direction2 = new BABYLON.Vector3(2, 2, 2)
	explosion.minEmitPower = 10
	explosion.maxEmitPower = 20
	explosion.start()

	flashScreen(scene, new BABYLON.Color3(1, 0.2, 0), 0.8, 500)

	setTimeout(() => explosion.stop(), 300)
}

function triggerPaddleHit() {}

function flashScreen(
	scene: BABYLON.Scene,
	color: BABYLON.Color3,
	intensity: number,
	duration: number,
): void {
	const imageProcessing = scene.imageProcessingConfiguration
	const originalVignette = imageProcessing.vignetteEnabled
	imageProcessing.vignetteEnabled = true
	imageProcessing.vignetteColor = BABYLON.Color4.FromColor3(color, 0.5)
	imageProcessing.vignetteWeight = intensity
	setTimeout(() => {
		imageProcessing.vignetteWeight = 0
		imageProcessing.vignetteEnabled = originalVignette
	}, duration)
}
