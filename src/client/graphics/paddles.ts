
import { PADDLE_BASE_HEIGHT, PADDLE_BASE_WIDTH, PADDLE_BASE_P1_POSITION, PADDLE_BASE_P2_POSITION } from '../../lib/engine/index.js'
import { toRenderPosition } from './utils.js'


export function createPaddles(scene: BABYLON.Scene, material: BABYLON.Material) {
  const paddle1 = BABYLON.MeshBuilder.CreateBox("p1", {
    width: PADDLE_BASE_HEIGHT,   
    height: 20,                 
    depth: PADDLE_BASE_WIDTH,  
  }, scene)
  paddle1.material = material
  paddle1.position = toRenderPosition(PADDLE_BASE_P1_POSITION)

  const paddle2 = BABYLON.MeshBuilder.CreateBox("p2", {
    width: PADDLE_BASE_HEIGHT,
    height: 20,
    depth: PADDLE_BASE_WIDTH,
  }, scene)
  paddle2.material = material
  paddle2.position = toRenderPosition(PADDLE_BASE_P2_POSITION)

  return { paddle1, paddle2 }
}






































