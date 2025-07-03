export function createCamera(
	scene: BABYLON.Scene,
	canvas: HTMLCanvasElement,
): BABYLON.Camera {
	const camera = new BABYLON.ArcRotateCamera(
		'camera',
		-Math.PI / 2,
		Math.PI / 3,
		1000,
		new BABYLON.Vector3(0, 0, 0),
		scene,
	)

	camera.lowerBetaLimit = 0.1
	camera.upperBetaLimit = Math.PI / 2.2
	camera.lowerRadiusLimit = 500
	camera.upperRadiusLimit = 1000
	camera.attachControl(canvas, true)

	return camera
}
