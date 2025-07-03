export function createPaddleMaterial(
	scene: BABYLON.Scene,
): BABYLON.StandardMaterial {
	const mat = new BABYLON.StandardMaterial('paddleMat', scene)
	mat.diffuseColor = new BABYLON.Color3(1, 1, 1)
	//mat.specularColor = new BABYLON.Color3(1,1,1)
	mat.disableLighting = false
	return mat
}

export function createBallMaterial(scene: BABYLON.Scene): BABYLON.PBRMaterial {
	const ballMat = new BABYLON.PBRMaterial('ballMat', scene)
	ballMat.albedoColor = new BABYLON.Color3(1, 1, 1)
	ballMat.metallic = 0.5
	ballMat.roughness = 0.2
	ballMat.disableLighting = false
	return ballMat
}

export function createPaddleMaterial2(
	scene: BABYLON.Scene,
): BABYLON.PBRMaterial {
	const mat = new BABYLON.PBRMaterial('newPaddlemat', scene)
	mat.albedoColor = new BABYLON.Color3(1, 1, 1)
	mat.metallic = 1
	mat.roughness = 1
	return mat
}

export function createMatwall(scene: BABYLON.Scene): BABYLON.PBRMaterial {
	const arenaMat = new BABYLON.PBRMaterial('arenaMat', scene)
	arenaMat.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1) // couleur sombre
	arenaMat.emissiveColor = new BABYLON.Color3(0.03, 0.03, 0.03) // effet lumineux
	arenaMat.metallic = 1
	arenaMat.roughness = 1

	return arenaMat
}
