import { Paddle } from "./Paddle.js";
import { Ball } from "./Ball.js";
import { Vector2 } from "./Vector2.js";

export const can = <HTMLCanvasElement>document.getElementById("canvas");
export const ctx = can.getContext("2d");

let lastFrameTime: number;

// Ball properties
const baseBallSize = 10;
const baseBallPosition = new Vector2(can.width / 2, can.height / 2);
export let ball: Ball;

// Paddle properties
const basePaddleHeight = can.height / 5;
const basePaddleWidth = can.width / 80;
const paddleOffsetFromWall = 10;
const basePaddleP1Position = new Vector2(
	paddleOffsetFromWall,
	can.height / 2 - basePaddleHeight / 2,
);
const basePaddleP2Position = new Vector2(
	can.width - basePaddleWidth - paddleOffsetFromWall,
	can.height / 2 - basePaddleHeight / 2,
);

type Player = "p1" | "p2";
type Move = "down" | "up";
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

const inputs: StateInput = {
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
	ctx.textAlign = "center";
	const str = `Player 1: ${scores.p1} | Player 2: ${scores.p2}`;
	ctx.fillText(str, can.width / 2, 10);
}

function handleInputs(delta: number) {
	// TODO: check bounds
	if (inputs.p1.up) paddles.p1.position.y -= delta * paddles.p1.speed;
	if (inputs.p1.down) paddles.p1.position.y += delta * paddles.p1.speed;
	if (inputs.p2.up) paddles.p2.position.y -= delta * paddles.p2.speed;
	if (inputs.p2.down) paddles.p2.position.y += delta * paddles.p2.speed;
}

function updateAll(delta: number) {
	// TODO: put logic in paddle class
	handleInputs(delta);
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
