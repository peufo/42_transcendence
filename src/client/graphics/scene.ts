import { toRenderPosition } from "./utils.js"
import { State } from '../../lib/engine/index.js'

export function updateGraphics(state: State, ballMesh: any, paddle1: any, paddle2: any): void {
  const p1 = state.paddles.p1
  const p2 = state.paddles.p2
  const ball = state.ball

  ballMesh.position = toRenderPosition(ball.position, ball.size, ball.size)
  paddle1.position = toRenderPosition(p1.position, p1.width, p1.height)
  paddle2.position = toRenderPosition(p2.position, p2.width, p2.height)

}

