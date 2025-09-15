import { scale } from './utils.js'

export function createArena(
	scene: BABYLON.Scene,
	material: BABYLON.Material,
	ARENA_WIDTH: number,
	ARENA_HEIGHT: number,
): void {
	const hl = new BABYLON.HighlightLayer('hl1', scene)

	const ground = BABYLON.MeshBuilder.CreateBox(
		'ground',
		{
			width: scale(ARENA_HEIGHT),
			height: 1,
			depth: scale(ARENA_WIDTH),
		},
		scene,
	)
	ground.position.y = 3.3
	ground.material = material

	ground.receiveShadows = false
	const wall = BABYLON.MeshBuilder.CreateBox(
		'wall',
		{
			width: scale(ARENA_HEIGHT),
			height: 5,
			depth: 2,
		},
		scene,
	)
	wall.position.z = scale(ARENA_WIDTH / 2)
	wall.position.y = 3.5

	hl.addMesh(wall, BABYLON.Color3.Blue())
	const wall2 = wall.clone('wall2')

	wall2.position.z = scale(-ARENA_WIDTH / 2)

	hl.addMesh(wall2, BABYLON.Color3.Blue())
	/*
    let faceColors = [
    new BABYLON.Color4(1, 0, 0, 1), // face avant
    new BABYLON.Color4(0, 1, 0, 1), // arrière
    new BABYLON.Color4(0, 0, 1, 1), // droite
    new BABYLON.Color4(1, 1, 0, 1), // gauche
    new BABYLON.Color4(0, 1, 1, 1), // haut
    new BABYLON.Color4(1, 0, 1, 1)  // bas
];
*/ // a exploiter potentiellement.

	const wall3 = BABYLON.MeshBuilder.CreateBox('wall3', {
		width: 2,
		height: 5,
		depth: scale(ARENA_WIDTH) + 2,
		//        faceColors: faceColors
	})
	wall3.position.z = 0
	wall3.position.x = scale(ARENA_HEIGHT / 2) + 1
	wall3.position.y = 3.5

	hl.addMesh(wall3, BABYLON.Color3.Blue())
	const wall4 = wall3.clone('wall4')
	wall4.position.x = scale(-ARENA_HEIGHT / 2) - 1

	hl.addMesh(wall4, BABYLON.Color3.Blue())
}
/*
/*
export async function createScore(scene: BABYLON.Scene, state: State)
{

    const fontData = await (await fetch("./fonts/Droid Sans_Regular.json")).json(); // Providing you have a font data file at that location
const text = BABYLON.MeshBuilder.CreateText(
  "myText",
  "Hello World !! @ #$ % é",
  fontData,
  {
    size: 16,
    resolution: 64,
    depth: 10,
  },
  scene,
);
    var myText = BABYLON.MeshBuilder.CreateText("myText", "HELLO WORLD", fontData, {
        size: 16,
        resolution: 64,
        depth: 10,
        faceUV: [
            new BABYLON.Vector4(0, 0, 1, 1),
            new BABYLON.Vector4(0, 0, 1, 1),
            new BABYLON.Vector4(0, 0, 1, 1),
        ];
    });
}
*/
