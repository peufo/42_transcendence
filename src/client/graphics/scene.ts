

import { toRenderPosition } from "./utils.js"
import { PADDLE_BASE_HEIGHT ,PADDLE_BASE_WIDTH,BALL_BASE_SIZE ,State, PADDLE_BASE_P1_POSITION, PADDLE_BASE_P2_POSITION } from '../../lib/engine/index.js'
import { Vector2 } from "../../lib/engine/Vector2.js"

export function updateGraphics(
  state: State,
  ballMesh: BABYLON.Mesh,
  paddle1: BABYLON.Mesh,
  paddle2: BABYLON.Mesh
): void {
  ballMesh.position = toRenderPosition(
    new Vector2(state.b.x, state.b.y),
    BALL_BASE_SIZE,
    BALL_BASE_SIZE
  );

  const p1Pos = new Vector2(
    PADDLE_BASE_P1_POSITION.x,
    state.p1
  );
  paddle1.position = toRenderPosition(
    p1Pos,
    PADDLE_BASE_WIDTH,
    PADDLE_BASE_HEIGHT
  );

  const p2Pos = new Vector2(
    PADDLE_BASE_P2_POSITION.x,
    state.p2
  );
  paddle2.position = toRenderPosition(
    p2Pos,
    PADDLE_BASE_WIDTH,
    PADDLE_BASE_HEIGHT
  );
}
