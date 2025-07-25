import {
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
} from '../../lib/engine/index.js'
import {  scale, toRenderPosition } from './utils.js'

export function createPaddles(
	scene: BABYLON.Scene,
	material: BABYLON.Material,
) {
	const paddle1 = BABYLON.MeshBuilder.CreateBox(
		'p1',
		{
			width: scale(PADDLE_BASE_HEIGHT),
			height: scale(20),
			depth: scale(PADDLE_BASE_WIDTH),
		},
		scene,
	)
	paddle1.material = material
	paddle1.position = toRenderPosition(PADDLE_BASE_P1_POSITION)
	const paddle2 = BABYLON.MeshBuilder.CreateBox(
		'p2',
		{
			width: scale(PADDLE_BASE_HEIGHT),
			height: scale(20),
			depth: scale(PADDLE_BASE_WIDTH),
		},
		scene,
	)
	paddle2.material = material
	paddle2.position = toRenderPosition(PADDLE_BASE_P2_POSITION)

	return { paddle1, paddle2 }
}

/*
export async function createPaddles(
    scene: BABYLON.Scene,
    material: BABYLON.Material
): Promise<{ paddle1: BABYLON.AbstractMesh; paddle2: BABYLON.AbstractMesh }> {
    const result = await BABYLON.SceneLoader.AppendAsync(
        "/public/textures/paddle/",
        "croissant_4k.gltf",
        scene
    );
	const allMeshes = scene.meshes;
const model = allMeshes.find(mesh => mesh.name === "croissant" || mesh.name.toLowerCase().includes("croissant"));

if (!model) {
  throw new Error("Croissant mesh not found in scene.");
}

const paddle1 = model as BABYLON.Mesh;
paddle1.name = "paddle1";
paddle1.position = toRenderPosition(PADDLE_BASE_P1_POSITION);
paddle1.material = material;

const paddle2 = paddle1.clone("paddle2", null) as BABYLON.Mesh;
paddle2.position = toRenderPosition(PADDLE_BASE_P2_POSITION);
paddle2.material = material;

return { paddle1, paddle2 };
}

export async function createPaddles(
    scene: BABYLON.Scene,
    material: BABYLON.Material
): Promise<{ paddle1: BABYLON.AbstractMesh; paddle2: BABYLON.AbstractMesh }> {
    try {
        const result = await BABYLON.SceneLoader.AppendAsync(
            "/public/textures/paddle/croissant/", // Chemin corrigé
            "croissant_4k.gltf",
            scene
        );
        console.log("GLTF loaded successfully. Meshes:", scene.meshes.map(mesh => mesh.name));

        const allMeshes = scene.meshes;
        const model = allMeshes.find(mesh => 
            mesh.name === "croissant" || 
            mesh.name === "Croissant_croissant_10M_textured.001" || 
            mesh.name.toLowerCase().includes("croissant")
        );

        if (!model) {
            throw new Error("Croissant mesh not found in scene. Available meshes: " + 
                scene.meshes.map(mesh => mesh.name).join(", "));
        }

        if (!(model instanceof BABYLON.Mesh)) {
            throw new Error("Model is not a BABYLON.Mesh: " + model);
        }

        const paddle1 = model as BABYLON.Mesh;
        paddle1.name = "paddle1";
        paddle1.position = toRenderPosition(PADDLE_BASE_P1_POSITION);
        paddle1.scaling = new BABYLON.Vector3(50, 50, 50); // Augmente l'échelle
        console.log("Paddle1 position:", paddle1.position.asArray(), "Scaling:", paddle1.scaling.asArray(), "Visibility:", paddle1.visibility);
        // paddle1.material = material;

        const paddle2 = paddle1.clone("paddle2", null) as BABYLON.Mesh;
        paddle2.position = toRenderPosition(PADDLE_BASE_P2_POSITION);
        paddle2.scaling = new BABYLON.Vector3(50, 50, 50); // Augmente l'échelle
        console.log("Paddle2 position:", paddle2.position.asArray(), "Scaling:", paddle2.scaling.asArray(), "Visibility:", paddle2.visibility);
        // paddle2.material = material;

        return { paddle1, paddle2 };
    } catch (error) {
        console.error("Failed to create paddles:", error);
        throw error;
    }
}


import {
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	PADDLE_BASE_WIDTH,
} from '../../lib/engine/index.js'
import { scale, toRenderPosition } from './utils.js'

export async function createPaddles(
	scene: BABYLON.Scene,
	material: BABYLON.Material,
): Promise<{ paddle1: BABYLON.AbstractMesh; paddle2: BABYLON.AbstractMesh }> {
	try {
		const result = await BABYLON.SceneLoader.AppendAsync(
			'/public/textures/paddle/croissant/', // Chemin corrigé
			'croissant_4k.gltf',
			scene,
		)
		console.log(
			'GLTF loaded successfully. Meshes:',
			scene.meshes.map((mesh) => mesh.name),
		)

		const allMeshes = scene.meshes
		const model = allMeshes.find(
			(mesh) =>
				mesh.name === 'croissant' ||
				mesh.name === 'Croissant_croissant_10M_textured.001' ||
				mesh.name.toLowerCase().includes('croissant'),
		)

		if (!model) {
			throw new Error(
				'Croissant mesh not found in scene. Available meshes: ' +
					scene.meshes.map((mesh) => mesh.name).join(', '),
			)
		}

		if (!(model instanceof BABYLON.Mesh)) {
			throw new Error('Model is not a BABYLON.Mesh: ' + model)
		}

		// boites invisibles pour la hitbox
		const paddle1Hitbox = BABYLON.MeshBuilder.CreateBox(
			'p1_hitbox',
			{
				width: scale(PADDLE_BASE_HEIGHT),
				height: scale(20),
				depth: scale(PADDLE_BASE_WIDTH),
			},
			scene,
		)
		paddle1Hitbox.position = toRenderPosition(PADDLE_BASE_P1_POSITION)
		paddle1Hitbox.isVisible = false // boite invisible
		console.log('Paddle1 hitbox position:', paddle1Hitbox.position.asArray())

		const paddle2Hitbox = BABYLON.MeshBuilder.CreateBox(
			'p2_hitbox',
			{
				width: scale(PADDLE_BASE_HEIGHT),
				height: scale(20),
				depth: scale(PADDLE_BASE_WIDTH),
			},
			scene,
		)
		paddle2Hitbox.position = toRenderPosition(PADDLE_BASE_P2_POSITION)
		paddle2Hitbox.isVisible = false
		console.log('Paddle2 hitbox position:', paddle2Hitbox.position.asArray())

		// Configurer les croissants comenfants des botes enfant
		const paddle1 = model as BABYLON.Mesh
		paddle1.name = 'paddle1'
		paddle1.parent = paddle1Hitbox // Attacher croissant a la bote
		paddle1.position = BABYLON.Vector3.Zero()
		paddle1.scaling = new BABYLON.Vector3(70, 70, 50)
		paddle1.visibility = 1
		console.log(
			'Paddle1 croissant position:',
			paddle1.position.asArray(),
			'Scaling:',
			paddle1.scaling.asArray(),
			'Visibility:',
			paddle1.visibility,
		)

		const paddle2 = paddle1.clone('paddle2', null) as BABYLON.Mesh
		paddle2.parent = paddle2Hitbox // Attacher le croissant à la boîte
		paddle2.position = BABYLON.Vector3.Zero() // Position relative
		paddle2.scaling = new BABYLON.Vector3(70, 70, 50)
		paddle2.visibility = 1
		console.log(
			'Paddle2 croissant position:',
			paddle2.position.asArray(),
			'Scaling:',
			paddle2.scaling.asArray(),
			'Visibility:',
			paddle2.visibility,
		)

		return { paddle1: paddle1Hitbox, paddle2: paddle2Hitbox }
	} catch (error) {
		console.error('Failed to create paddles:', error)
		throw error
	}
}

*/
