export function createPaddleMaterial(
	scene: BABYLON.Scene,
	color: BABYLON.Color3,
): BABYLON.PBRMaterial {
	const mat = new BABYLON.PBRMaterial('iridescentPaddle', scene)
	mat.albedoColor = color
	mat.metallic = 1.0
	mat.roughness = 0.1
	mat.iridescence.isEnabled = true
	mat.iridescence.intensity = 2
	mat.iridescence.minimumThickness = 200
	mat.indexOfRefraction = 2

	return mat
}

/*
export function createBallMaterial(
	scene: BABYLON.Scene,
): BABYLON.StandardMaterial {
	const ballMat = new BABYLON.StandardMaterial('ballMat', scene)
	ballMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2)
	ballMat.disableLighting = false
	return ballMat
}
 */
export function createBallMaterial(scene: BABYLON.Scene): BABYLON.PBRMaterial {
	const ballMat = new BABYLON.PBRMaterial('ballMat', scene)
	ballMat.albedoColor = new BABYLON.Color3(0.7, 0.1, 0.7)
	ballMat.metallic = 0.5
	ballMat.roughness = 0.4
	ballMat.emissiveColor = new BABYLON.Color3(0.7, 0.1, 0.7) // Lueur bleue
	ballMat.emissiveIntensity = 1

	return ballMat
}

/*
export function createWallMaterial(scene: BABYLON.Scene): BABYLON.StandardMaterial {
	const arenaMat = new BABYLON.StandardMaterial('arenaMat', scene)

	arenaMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2) // couleur sombre
	arenaMat.emissiveColor = new BABYLON.Color3(0.03, 0.03, 0.03) // effet lumineux
	arenaMat.roughness = 1

	return arenaMat
}

	*/
export function createWallMaterial(scene: BABYLON.Scene): BABYLON.PBRMaterial {
	const mat = new BABYLON.PBRMaterial('groundMat', scene)
	mat.environmentBRDFTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
		'/public/textures/polyhaven/cloud8k.env',
		scene,
	)
	mat.environmentIntensity = 2.5
	mat.albedoColor = new BABYLON.Color3(0.3, 0.3, 0.3)
	mat.metallic = 0.8
	mat.roughness = 0.3
	mat.environmentIntensity = 1.8
	mat.specularIntensity = 0.5

	mat.iridescence.isEnabled = true
	mat.iridescence.intensity = 1.2
	mat.iridescence.minimumThickness = 100
	mat.iridescence.maximumThickness = 400
	mat.iridescence.indexOfRefraction = 1.5

	mat.clearCoat.isEnabled = true
	mat.clearCoat.intensity = 1.0
	mat.clearCoat.roughness = 0.1
	mat.clearCoat.tintColor = new BABYLON.Color3(0.8, 0.8, 1.0)

	mat.sheen.isEnabled = true
	mat.sheen.intensity = 0.5
	mat.sheen.color = new BABYLON.Color3(1, 1, 1)
	mat.sheen.roughness = 0.6

	mat.subSurface.isScatteringEnabled = true
	mat.subSurface.tintColor = new BABYLON.Color3(0.1, 0.3, 0.5)
	mat.subSurface.minimumThickness = 1.5

	mat.anisotropy.isEnabled = true
	mat.anisotropy.intensity = 0.6
	mat.anisotropy.direction = new BABYLON.Vector2(1, 0) // Lignes horizontales

	mat.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.2)
	mat.emissiveIntensity = 2.0

	mat.alpha = 1
	mat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND

	const noiseTexture = new BABYLON.NoiseProceduralTexture('noise', 256, scene)
	noiseTexture.octaves = 3
	noiseTexture.persistence = 0.8
	noiseTexture.animationSpeedFactor = 0.5
	mat.iridescence.thicknessTexture = noiseTexture
	mat.clearCoat.texture = noiseTexture
	mat.subSurface.thicknessTexture = noiseTexture

	scene.registerBeforeRender(() => {
		mat.emissiveIntensity = 2 + Math.sin(Date.now() / 1000) * 0.5
		mat.iridescence.intensity = 1 + Math.cos(Date.now() / 1500) * 0.3
	})
	return mat
}
