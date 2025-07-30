export function setupVisualEffects(
	scene: BABYLON.Scene,
	ballMesh: BABYLON.Mesh,
): void {
	const glow = new BABYLON.GlowLayer('glow', scene)
	glow.addIncludedOnlyMesh(ballMesh)

	const particleSystem = new BABYLON.ParticleSystem('particles', 2000, scene)
	particleSystem.particleTexture = new BABYLON.Texture(
		'https://assets.babylonjs.com/textures/flare.png',
	)
	particleSystem.emitter = ballMesh
	particleSystem.minSize = 0.5
	particleSystem.maxSize = 2.0
	particleSystem.minLifeTime = 0.3
	particleSystem.maxLifeTime = 1.0
	particleSystem.emitRate = 300
	particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1)
	particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 1)
	particleSystem.minEmitPower = 2
	particleSystem.maxEmitPower = 5
	particleSystem.updateSpeed = 0.01
	particleSystem.start()
}

export function createFrictionSparks(
	scene: BABYLON.Scene,
	paddle: BABYLON.AbstractMesh,
): BABYLON.ParticleSystem {
	const sparks = new BABYLON.ParticleSystem('frictionSparks', 500, scene)
	sparks.emitter = new BABYLON.Vector3(0, -paddle.scaling.y / 2, 0)
	sparks.particleTexture = new BABYLON.Texture(
		'https://assets.babylonjs.com/textures/flare.png',
		scene,
	)
	sparks.minSize = 0.1
	sparks.maxSize = 0.3
	sparks.minLifeTime = 0.2
	sparks.maxLifeTime = 0.5
	sparks.emitRate = 100
	sparks.color1 = new BABYLON.Color4(1, 0.5, 0, 1)
	sparks.color2 = new BABYLON.Color4(1, 0.2, 0, 0)
	sparks.direction1 = new BABYLON.Vector3(-0.5, 0.1, -0.5)
	sparks.direction2 = new BABYLON.Vector3(0.5, 0.5, 0.5)
	sparks.minEmitPower = 1
	sparks.maxEmitPower = 3
	sparks.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD
	sparks.gravity = new BABYLON.Vector3(0, -9.81, 0)
	return sparks
}

export function setupHighlightEffects(): void {
	//const hl = new BABYLON.HighlightLayer('hl1', scene)
	//meshes.forEach((mesh) => hl.addMesh(mesh, BABYLON.Color3.Blue()))
}

export function setupWallCollisionParticles(
	scene: BABYLON.Scene,
): BABYLON.ParticleSystem {
	const system = new BABYLON.ParticleSystem('wallParticles', 1000, scene)
	system.particleTexture = new BABYLON.Texture(
		'https://assets.babylonjs.com/textures/flare.png',
	)
	system.emitter = new BABYLON.Vector3(0, 0, 0)
	system.minSize = 0.3
	system.maxSize = 1.5
	system.minLifeTime = 0.2
	system.maxLifeTime = 0.8
	system.emitRate = 500
	system.color1 = new BABYLON.Color4(1, 0.5, 0, 1)
	system.color2 = new BABYLON.Color4(1, 1, 0, 1)
	system.minEmitPower = 5
	system.maxEmitPower = 10
	system.direction1 = new BABYLON.Vector3(-1, 0, 0)
	system.direction2 = new BABYLON.Vector3(1, 0, 0)
	system.updateSpeed = 0.01
	system.isLocal = false
	return system
}
