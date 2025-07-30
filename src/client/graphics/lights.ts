/*export function createLights(scene: BABYLON.Scene): BABYLON.DirectionalLight {
	const hemiLight = new BABYLON.HemisphericLight(
		'light1',
		new BABYLON.Vector3(0, 40, 0),
		scene,
	)
	hemiLight.intensity = 0.4
	const dirLight1 = new BABYLON.DirectionalLight(
		'dirLight1',
		new BABYLON.Vector3(2, -2, -1),
		scene,
	)
	dirLight1.position = new BABYLON.Vector3(100, 240, 120)
	dirLight1.intensity = 1
	// Dans lights.ts, après dirLight1
const ballLight = new BABYLON.PointLight('ballLight', new BABYLON.Vector3(0, 0, 0), this.scene);
ballLight.intensity = 2.0;
ballLight.range = 50;
ballLight.parent = this.ballMesh; // Suit la balle
	return dirLight1
}

*/
export function createLights(scene: BABYLON.Scene): BABYLON.DirectionalLight {
	const hemiLight = new BABYLON.HemisphericLight(
		'light1',
		new BABYLON.Vector3(0, 40, 0),
		scene,
	)
	hemiLight.intensity = 0.4

	const dirLight1 = new BABYLON.DirectionalLight(
		'dirLight1',
		new BABYLON.Vector3(2, -2, -1),
		scene,
	)
	dirLight1.position = new BABYLON.Vector3(100, 240, 120)
	dirLight1.intensity = 1

	const ballLight = new BABYLON.PointLight(
		'ballLight',
		new BABYLON.Vector3(0, 0, 0),
		scene,
	)
	ballLight.intensity = 2.0
	ballLight.range = 50
	ballLight.parent = scene.getMeshByName('ball')

	scene.registerBeforeRender(() => {
		ballLight.intensity = 2 + Math.sin(Date.now() / 500) * 3.5 // Pulsation
	})

	return dirLight1
}
