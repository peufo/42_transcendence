/// <reference path="../../../node_modules/babylonjs/babylon.d.ts" />
/// <reference path="../../../node_modules/babylonjs-gui/babylon.gui.d.ts" />

import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	Engine as GameEngine,
	type Scores,
	type State,
} from '../../lib/engine/index.js'

import { createArena } from '../graphics/arena.js'
import { createBall } from '../graphics/ball.js'
import { createCamera } from '../graphics/camera.js'
import { createLights } from '../graphics/lights.js'
import {
	createBallMaterial,
	createMatwall,
	createPaddleMaterial,
} from '../graphics/materials.js'
import { createPaddles } from '../graphics/paddles.js'
import { updateGraphics } from '../graphics/scene.js'

customElements.define(
	'ft-babylon',
	class extends HTMLElement {
		canvas: HTMLCanvasElement
		babylonEngine: BABYLON.Engine
		scene: BABYLON.Scene
		camera: BABYLON.Camera
		light: BABYLON.DirectionalLight
		ballMesh: BABYLON.Mesh
		paddle1: BABYLON.Mesh
		paddle2: BABYLON.Mesh
		gameLogicEngine: GameEngine
		guiTexture: BABYLON.GUI.AdvancedDynamicTexture
		scoreText: BABYLON.GUI.TextBlock

		constructor() {
			super()
			this.classList.add('w-full', 'h-full')

			this.initCanvasAndEngine()
			this.setupScene()
			this.createGameObjects()
			this.setupVisualEffects()
			this.setupShadows()
			this.startEngine()
			this.setupControls()
			this.setupScore()

			this.babylonEngine.runRenderLoop(() => this.scene.render())
		}

		connectedCallback() {
			window.addEventListener('resize', () => this.babylonEngine.resize())
		}

		initCanvasAndEngine() {
			this.canvas = document.createElement('canvas')
			this.canvas.style.width = '100%'
			this.canvas.style.height = '100%'
			this.appendChild(this.canvas)

			this.babylonEngine = new BABYLON.Engine(this.canvas, true, {
				stencil: true,
			})
			this.scene = new BABYLON.Scene(this.babylonEngine)
			this.scene.clearColor = new BABYLON.Color4(0.6, 1, 0.8)
			this.scene.lightsEnabled = true
			this.scene.ambientColor = new BABYLON.Color3(0.7, 0.7, 0.7)
		}

		setupScene() {
			this.camera = createCamera(this.scene, this.canvas)
			this.light = createLights(this.scene)
			const pipeline = new BABYLON.DefaultRenderingPipeline(
				'defaultPipeline',
				true,
				this.scene,
				[this.camera],
			)
			pipeline.bloomEnabled = true
			pipeline.imageProcessingEnabled = true
			pipeline.fxaaEnabled = true
		}

		setupScore() {
			this.guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
				'UI',
				true,
				this.scene,
			)
			this.scoreText = new BABYLON.GUI.TextBlock()
			this.scoreText.text = '0 : 0'
			this.scoreText.color = 'blue'
			this.scoreText.fontSize = 48
			this.scoreText.top = '-440px'
			this.scoreText.verticalAlignment =
				BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
			this.scoreText.textHorizontalAlignment =
				BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
			this.guiTexture.addControl(this.scoreText)
		}
		createGameObjects() {
			const wallMaterial = createMatwall(this.scene)
			const paddleMaterial = createPaddleMaterial(this.scene)
			const ballMaterial = createBallMaterial(this.scene)

			createArena(this.scene, wallMaterial, ARENA_WIDTH, ARENA_HEIGHT)

			const paddles = createPaddles(this.scene, paddleMaterial)
			this.paddle1 = paddles.paddle1
			this.paddle2 = paddles.paddle2

			this.ballMesh = createBall(this.scene, ballMaterial)
		}

		setupVisualEffects() {
			const trail = new BABYLON.TrailMesh('trail', this.ballMesh, this.scene, {
				diameter: 6,
				length: 10,
				segments: 1,
				sections: 4,
				doNotTaper: false,
				autoStart: true,
			})

			const trailMat = new BABYLON.StandardMaterial('trailMat', this.scene)
			trailMat.emissiveColor = new BABYLON.Color3(0, 0, 1)
			trail.material = trailMat

			const glow = new BABYLON.GlowLayer('glow', this.scene)
			glow.addIncludedOnlyMesh(this.ballMesh)
		}

		setupShadows() {
			const shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light)
			shadowGenerator.useExponentialShadowMap = true
			shadowGenerator.useBlurExponentialShadowMap = true
			shadowGenerator.blurKernel = 32
			shadowGenerator.darkness = 0.5

			shadowGenerator.addShadowCaster(this.ballMesh)
			shadowGenerator.addShadowCaster(this.paddle1)
			shadowGenerator.addShadowCaster(this.paddle2)

			const ground = this.scene.getMeshByName('ground')
			if (ground) ground.receiveShadows = true
		}

		startEngine() {
			this.gameLogicEngine = new GameEngine({
				onTick: this.renderGameState.bind(this),
				onScore: this.handleScoreUpdate.bind(this),
			})
			this.gameLogicEngine.start()
		}
		handleScoreUpdate(scores: Scores) {
			console.log('Score updated:', scores)
			this.scoreText.text = `${scores.p1} : ${scores.p2}`
		}

		setupControls() {
			const keyHandlers: Record<string, (value: boolean) => void> = {
				a: (v) => this.gameLogicEngine.setInput('p1', 'up', v),
				d: (v) => this.gameLogicEngine.setInput('p1', 'down', v),
				j: (v) => this.gameLogicEngine.setInput('p2', 'up', v),
				l: (v) => this.gameLogicEngine.setInput('p2', 'down', v),
			}

			document.addEventListener('keydown', (e) => keyHandlers[e.key]?.(true))
			document.addEventListener('keyup', (e) => keyHandlers[e.key]?.(false))
		}

		renderGameState(state: State) {
			updateGraphics(state, this.ballMesh, this.paddle1, this.paddle2)
		}
	},
)
