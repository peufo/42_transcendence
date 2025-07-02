
export function createPaddles(
  scene: BABYLON.Scene,
  material: BABYLON.Material,
  ARENA_WIDTH: number,
  ARENA_HEIGHT: number
): { paddle1: BABYLON.Mesh, paddle2: BABYLON.Mesh } {
  const paddle1 = BABYLON.MeshBuilder.CreateBox("p1", {
    width: ARENA_WIDTH / 5,
    height: ARENA_HEIGHT / 60,   
    depth: 20
  }, scene)
  paddle1.material = material

  const paddle2 = paddle1.clone("p2")!
  paddle2.material = material
  return { paddle1, paddle2 }
}

