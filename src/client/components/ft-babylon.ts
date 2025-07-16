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
export const RENDER_SCALE = 0.1
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
			this.disconnectedCallback
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
			//this.scene.clearColor = new BABYLON.Color4(0.6, 1, 1)
			this.scene.lightsEnabled = true
			//this.scene.ambientColor = new BABYLON.Color3(1, 1, 1)
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
			//this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
			//BABYLON.Scene.FOGMODE_NONE;
			//BABYLON.Scene.FOGMODE_EXP;
			//BABYLON.Scene.FOGMODE_EXP2;
			//BABYLON.Scene.FOGMODE_LINEAR;

			//	this.scene.fogColor = new BABYLON.Color3(0.7, 0.85, 1);
			//	this.scene.fogDensity = 0.001;

			/*
			 */
			if (!this.scene.getMeshByName('BackgroundSkybox')) {
				const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
					'/public/textures/polyhaven/cloud8k.env',
					this.scene,
				)
				this.scene.environmentTexture = envTexture
				this.scene.createDefaultSkybox(envTexture, true, 5000)
			}
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
			const trail = new BABYLON.TrailMesh('new', this.ballMesh, this.scene, {
				diameter: 1,
				length: 20,
				segments: 20,
				sections: 8,
				autoStart: true,
			})

			const trailMat = new BABYLON.StandardMaterial('trailMat', this.scene)
			trailMat.emissiveColor = new BABYLON.Color3(0, 0, 1)
			trail.material = trailMat

			const glow = new BABYLON.GlowLayer('glow', this.scene)
			glow.addIncludedOnlyMesh(this.ballMesh)
			const myParticleSystem = new BABYLON.ParticleSystem(
				'particles',
				2000,
				this.scene,
			)
			myParticleSystem.particleTexture = new BABYLON.Texture(
				'https://assets.babylonjs.com/textures/flare.png',
			)
			/*
			myParticleSystem.emitter = new BABYLON.Vector3(0, 10, 0)
			myParticleSystem.minSize = 0.5;
myParticleSystem.maxSize = 5.5;
myParticleSystem.minLifeTime = 0.3;
myParticleSystem.maxLifeTime = 1.2;
myParticleSystem.emitRate = 500;
myParticleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
myParticleSystem.color2 = new BABYLON.Color4(1, 1, 0, 1);
myParticleSystem.direction1 = new BABYLON.Vector3(-1, 1, 0);
myParticleSystem.direction2 = new BABYLON.Vector3(1, 1, 0);
myParticleSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5); // position de spawn aléatoire
myParticleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);

myParticleSystem.direction1 = new BABYLON.Vector3(0, 1, 0); // monte tout droit
myParticleSystem.direction2 = new BABYLON.Vector3(0, 1.5, 0); // ou plus vite

myParticleSystem.minEmitPower = 1;
myParticleSystem.maxEmitPower = 3;

myParticleSystem.updateSpeed = 0.01;

myParticleSystem.gravity = new BABYLON.Vector3(0, -1, 0); // tire vers le bas (effet feu)



			myParticleSystem.start();
			console.log("Fire system started:", myParticleSystem);

*/
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

		disconnectedCallback() {
			console.log('Disposing Babylon properly')

			if (this.scene.environmentTexture) {
				const envTex = this.scene.environmentTexture

				if (
					envTex instanceof BABYLON.CubeTexture &&
					envTex.name.startsWith('blob:')
				) {
					URL.revokeObjectURL(envTex.name)
				}

				envTex.dispose()
				this.scene.environmentTexture = null
			}

			const skybox = this.scene.getMeshByName('BackgroundSkybox')
			skybox?.dispose()

			this.babylonEngine?.stopRenderLoop()
			this.scene?.dispose()
			this.babylonEngine?.dispose()
			this.canvas?.remove()

			window.removeEventListener('resize', () => this.babylonEngine.resize())

			console.log('Babylon cleaned')
		}
	},
)
