/// <reference path="../../../node_modules/babylonjs/babylon.d.ts" />
/// <reference path="../../../node_modules/babylonjs-gui/babylon.gui.d.ts" />

import type { Engine as GameEngine } from '../../lib/engine/index.js'
import * as Graphics from '../graphics/index.js'

export const RENDER_SCALE = 0.1
customElements.define(
	'ft-babylon',
	class extends HTMLElement {
		private canvas: HTMLCanvasElement
		private babylonEngine: BABYLON.Engine
		private scene: BABYLON.Scene
		private camera: BABYLON.ArcRotateCamera
		private light: BABYLON.DirectionalLight
		private ballMesh: BABYLON.Mesh
		private paddle1: BABYLON.AbstractMesh
		private paddle2: BABYLON.AbstractMesh
		private gameLogicEngine: GameEngine
		private guiTexture: BABYLON.GUI.AdvancedDynamicTexture
		private scoreText: BABYLON.GUI.TextBlock
		// private wallParticleSystem: BABYLON.ParticleSystem

		constructor() {
			super()
			this.classList.add('w-full', 'h-full')
			this.initAsync()
		}

		async initAsync() {
			try {
				this.initCanvasAndEngine()
				this.camera = Graphics.createCamera(this.scene, this.canvas)
				this.light = Graphics.createLights(this.scene)
				Graphics.setupEnvironment(this.scene, this.camera)
				const { ballMesh, paddle1, paddle2 } = await Graphics.createGameObjects(
					this.scene,
				)
				this.ballMesh = ballMesh
				this.paddle1 = paddle1
				this.paddle2 = paddle2
				Graphics.setupVisualEffects(this.scene, this.ballMesh)
				Graphics.setupShadows(
					this.scene,
					this.light,
					this.ballMesh,
					this.paddle1,
					this.paddle2,
				)
				// this.wallParticleSystem = Graphics.setupWallCollisionParticles(
				// 	this.scene,
				// )
				this.setupScore()
				//this.startEngine()
				this.setupControls()
				this.babylonEngine.runRenderLoop(() => this.scene.render())
			} catch (error) {
				console.error('Initialization failed:', error)
			}
		}

		connectedCallback() {
			window.addEventListener('resize', () => this.babylonEngine.resize())
		}

		private initCanvasAndEngine() {
			this.canvas = document.createElement('canvas')
			this.canvas.style.width = '100%'
			this.canvas.style.height = '100%'
			this.appendChild(this.canvas)

			this.babylonEngine = new BABYLON.Engine(this.canvas, true, {
				stencil: true,
			})
			this.scene = new BABYLON.Scene(this.babylonEngine)
			this.scene.lightsEnabled = true
		}

		private setupScore() {
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

		// private startEngine() {
		// 	this.gameLogicEngine = new GameEngine({
		// 		onTick: this.renderGameState.bind(this),
		// 		onRoundEnd: this.handleScoreUpdate.bind(this),
		// 		onCollision: (c) =>
		// 			Graphics.handleCollision(
		// 				c,
		// 				this.ballMesh,
		// 				this.paddle1,
		// 				this.paddle2,
		// 				this.scene,
		// 				this.camera,
		// 				this.wallParticleSystem,
		// 			),
		// 	})
		// 	this.gameLogicEngine.start()
		// }

		// private handleScoreUpdate(scores: Scores) {
		// 	this.scoreText.text = `${scores.p1} : ${scores.p2}`
		// }

		private setupControls() {
			const keyHandlers: Record<string, (value: boolean) => void> = {
				a: (v) => this.gameLogicEngine.setInput('p1', 'up', v),
				d: (v) => this.gameLogicEngine.setInput('p1', 'down', v),
				j: (v) => this.gameLogicEngine.setInput('p2', 'up', v),
				l: (v) => this.gameLogicEngine.setInput('p2', 'down', v),
			}

			document.addEventListener('keydown', (e) => keyHandlers[e.key]?.(true))
			document.addEventListener('keyup', (e) => keyHandlers[e.key]?.(false))
		}

		// private renderGameState(state: State) {
		// 	Graphics.updateGraphics(state, this.ballMesh, this.paddle1, this.paddle2)
		// }

		disconnectedCallback() {
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

			this.babylonEngine.stopRenderLoop()
			this.scene.dispose()
			this.babylonEngine.dispose()
			this.canvas.remove()
			window.removeEventListener('resize', () => this.babylonEngine.resize())
		}
	},
)
