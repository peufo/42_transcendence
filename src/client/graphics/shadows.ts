export function setupShadows(
	scene: BABYLON.Scene,
	light: BABYLON.DirectionalLight,
	ballMesh: BABYLON.Mesh,
	paddle1: BABYLON.AbstractMesh,
	paddle2: BABYLON.AbstractMesh,
): void {
	const shadowGenerator = new BABYLON.ShadowGenerator(2048, light)
	shadowGenerator.usePoissonSampling = true
	shadowGenerator.blurKernel = 16
	shadowGenerator.darkness = 0.7
	shadowGenerator.bias = 0.0001
	shadowGenerator.normalBias = 0.01
	light.shadowMinZ = 1
	light.shadowMaxZ = 200

	shadowGenerator.addShadowCaster(ballMesh)
	shadowGenerator.addShadowCaster(paddle1)
	shadowGenerator.addShadowCaster(paddle2)

	const ground = scene.getMeshByName('ground')
	if (ground) ground.receiveShadows = true
}
