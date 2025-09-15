export function createCamera(
	scene: BABYLON.Scene,
	canvas: HTMLCanvasElement,
): BABYLON.ArcRotateCamera {
	const camera = new BABYLON.ArcRotateCamera(
		'camera',
		0,
		Math.PI / 5,
		110,
		new BABYLON.Vector3(0, 0, 0),
		scene,
	)

	camera.lowerBetaLimit = 0.1
	camera.upperBetaLimit = Math.PI / 2.2
	camera.lowerRadiusLimit = 50
	camera.upperRadiusLimit = 200

	camera.inputs.clear()
	camera.inputs.addMouseWheel()
	camera.inputs.addPointers()
	camera.attachControl(canvas, true)
	return camera
}
