export function setupEnvironment(
	scene: BABYLON.Scene,
	camera: BABYLON.Camera,
): void {
	const pipeline = new BABYLON.DefaultRenderingPipeline(
		'defaultPipeline',
		true,
		scene,
		[camera],
	)
	pipeline.bloomEnabled = true
	pipeline.imageProcessingEnabled = true
	pipeline.fxaaEnabled = true

	if (!scene.getMeshByName('BackgroundSkybox')) {
		const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
			'/public/textures/polyhaven/cloud8k.env',
			scene,
		)
		scene.environmentTexture = envTexture
		const skybox = scene.createDefaultSkybox(envTexture, true, 5000)
		scene.registerBeforeRender(() => {
			if (skybox) skybox.rotation.y += 0.0001
		})
	}
}
