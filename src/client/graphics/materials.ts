export function createBallMaterial2(scene: BABYLON.Scene): BABYLON.PBRMaterial {
    const mat = new BABYLON.PBRMaterial("ballMat", scene);
    mat.albedoTexture = new BABYLON.Texture("/public/textures/polyhaven/test/textures/aerial_rocks_02_diff_2k.jpg", scene);

    mat.metallic = 0;
    mat.roughness = 1;
    //mat.environmentTexture = scene.environmentTexture;

    return mat;
}


export function createPaddleMaterial(
	scene: BABYLON.Scene,
): BABYLON.StandardMaterial {
	const mat = new BABYLON.StandardMaterial('paddleMat', scene)
	mat.diffuseColor = new BABYLON.Color3(1, 1, 1)
	//mat.specularColor = new BABYLON.Color3(1,1,1)
	mat.disableLighting = false
	return mat
}

export function createBallMaterial(scene: BABYLON.Scene): BABYLON.StandardMaterial {
	const ballMat = new BABYLON.StandardMaterial('ballMat', scene)
	ballMat.diffuseColor = new BABYLON.Color3(1, 1, 1)
	ballMat.roughness = 0.2
	ballMat.disableLighting = false
	return ballMat
}

export function createPaddleMaterial2(
	scene: BABYLON.Scene,
): BABYLON.StandardMaterial {
	const mat = new BABYLON.StandardMaterial('newPaddlemat', scene)
	mat.diffuseColor = new BABYLON.Color3(1, 1, 1)
	mat.roughness = 1
	return mat
}

export function createMatwall(scene: BABYLON.Scene): BABYLON.StandardMaterial {
	const arenaMat = new BABYLON.StandardMaterial('arenaMat', scene)
	arenaMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1) // couleur sombre
	arenaMat.emissiveColor = new BABYLON.Color3(0.03, 0.03, 0.03) // effet lumineux
	arenaMat.roughness = 1

	return arenaMat
}
