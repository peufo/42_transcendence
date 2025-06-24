import { Paddle } from "./Paddle.js";
import { Ball } from "./Ball.js";
import { Vector2 } from "./Vector2.js";

export const can = <HTMLCanvasElement>document.getElementById("canvas");
export const ctx = can.getContext("2d");

let lastFrameTime: number;

// Ball properties
export const ballSpeedRamp = 1.07;
export const ballMaxBounceAngle = (4 * Math.PI) / 12; // radians
export const baseBallSpeed = 0.35;
const baseBallSize = 12;
const baseBallPosition = new Vector2(can.width / 2 - baseBallSize / 2, can.height / 2 - baseBallSize / 2);
export let ball: Ball;

// Paddle properties
export const basePaddleSpeed = 0.5
const basePaddleHeight = can.height / 5;
const basePaddleWidth = can.width / 60;
const paddleOffsetFromWall = basePaddleWidth;
const basePaddleP1Position = new Vector2(
	paddleOffsetFromWall,
	can.height / 2 - basePaddleHeight / 2,
);
const basePaddleP2Position = new Vector2(
	can.width - basePaddleWidth - paddleOffsetFromWall,
	can.height / 2 - basePaddleHeight / 2,
);

type Player = "p1" | "p2";
export type Move = "down" | "up";
type StateInput = Record<Player, Record<Move, boolean>>;

type Paddles = Record<Player, Paddle | null>;
type Scores = Record<Player, number>;
type State = {
	ball: Ball,
	paddles: Paddles,
	scores: Scores
}

export const paddles: Paddles = {
	p1: null,
	p2: null,
};
const scores: Scores = {
	p1: 0,
	p2: 0,
};

export const inputs: StateInput = {
	p1: { down: false, up: false },
	p2: { down: false, up: false },
};

function setInput(player: Player, move: Move, value: boolean) {
	inputs[player][move] = value;
}

// Est-ce que c'est ca qui provoque l'update
function getState(): State {
	return {
		ball,
		paddles,
		scores
	}
}

export const engine = {
	setInput,
	getState
}

const keyHandlers: Record<string, (value: boolean) => void> = {
	w: (value) => setInput("p1", "up", value),
	s: (value) => setInput("p1", "down", value),
	i: (value) => setInput("p2", "up", value),
	k: (value) => setInput("p2", "down", value),
}

document.addEventListener("keydown", (event) => {
	keyHandlers[event.key]?.(true)
});

document.addEventListener("keyup", (event) => {
	keyHandlers[event.key]?.(false)
});

// TODO: engine.ball returns ball object with infos for rendering (position, size)
// ...
function drawAll() {
	ctx?.clearRect(0, 0, can.width, can.height);
	ball.draw();
	paddles.p1.draw();
	paddles.p2.draw();

	const str = `Player 1: ${scores.p1} | Player 2: ${scores.p2}`;
	ctx.textAlign = "center";
	ctx.fillText(str, can.width / 2, 10);
}

function updateAll(delta: number) {
	paddles.p1?.update(delta, inputs.p1);
	paddles.p2?.update(delta, inputs.p2);
	ball.update(delta);
	drawAll();
}

function newFrame(timestamp: number) {
	if (lastFrameTime) {
		const delta = timestamp - lastFrameTime;
		updateAll(delta);
	}
	lastFrameTime = timestamp;
	requestAnimationFrame(newFrame);
}

export function scorePoint(player: Player) {
	scores[player]++;
	newGame();
}

function newGame() {
	ball = new Ball(baseBallPosition, baseBallSize);
	paddles.p1 = new Paddle(
		basePaddleP1Position,
		basePaddleWidth,
		basePaddleHeight,
	);
	paddles.p2 = new Paddle(
		basePaddleP2Position,
		basePaddleWidth,
		basePaddleHeight,
	);
}

newGame();
requestAnimationFrame(newFrame);
