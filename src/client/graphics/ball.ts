import { scale }  from './utils.js'
export function createBall(
	scene: BABYLON.Scene,
	material: BABYLON.Material,
): BABYLON.Mesh {
	
	const ball = BABYLON.MeshBuilder.CreateSphere('ball', { diameter: scale(22) }, scene)
	ball.material = material
	const hl = new BABYLON.HighlightLayer('hl1', scene)
	hl.addMesh(ball, BABYLON.Color3.Blue())
	return ball
}
