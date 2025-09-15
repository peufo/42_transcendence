/// <reference path="../../../node_modules/babylonjs/babylon.d.ts" />
/// <reference path="../../../node_modules/babylonjs-gui/babylon.gui.d.ts" />

import {
	ARENA_HEIGHT,
	type Collision,
	type GameOverData,
	type Player,
	type RoundData,
	type State,
} from '../../lib/engine/index.js'
import * as Graphics from '../graphics/index.js'
import { Renderer } from './Renderer.js'

export const RENDER_SCALE = 0.1
export class Renderer3D extends Renderer {
	private babylonEngine: BABYLON.Engine
	private scene: BABYLON.Scene
	private camera: BABYLON.ArcRotateCamera
	private light: BABYLON.DirectionalLight
	private ballMesh: BABYLON.Mesh
	private paddle1: BABYLON.AbstractMesh
	private paddle2: BABYLON.AbstractMesh
	private guiTexture: BABYLON.GUI.AdvancedDynamicTexture
	private scoreText: BABYLON.GUI.TextBlock
	private timerText: BABYLON.GUI.TextBlock
	private gameOverText: BABYLON.GUI.TextBlock
	private wallParticleSystem: BABYLON.ParticleSystem

	constructor(element: HTMLElement, names: Record<Player, string>) {
		super(element, names)
		this.initAsync()
		window.addEventListener('resize', () => this.babylonEngine.resize())
		// TODO: waiting frame?
	}

	private initAsync = async () => {
		try {
			this.initEngine()
			this.camera = Graphics.createCamera(this.scene, this.canvas)
			this.light = Graphics.createLights(this.scene)
			Graphics.setupEnvironment(this.scene, this.camera)
			const { ballMesh, paddle1, paddle2 } = await Graphics.createGameObjects(
				this.scene,
				this.user?.name === this.playerNames.p1
					? new BABYLON.Color3(0.498, 0.133, 0.996)
					: new BABYLON.Color3(0.996, 0.604, 0),
				this.user?.name === this.playerNames.p2
					? new BABYLON.Color3(0.498, 0.133, 0.996)
					: new BABYLON.Color3(0.996, 0.604, 0),
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
			this.wallParticleSystem = Graphics.setupWallCollisionParticles(this.scene)
			this.setupTexts()
			this.babylonEngine.runRenderLoop(() => {
				Graphics.updateGraphics(
					this.interpolate.getState(),
					this.ballMesh,
					this.paddle1,
					this.paddle2,
				)
				this.scene.render()
			})
		} catch (error) {
			console.error('Initialization failed:', error)
		}
	}

	private initEngine = () => {
		this.babylonEngine = new BABYLON.Engine(this.canvas, true, {
			stencil: true,
		})
		this.scene = new BABYLON.Scene(this.babylonEngine)
		this.scene.lightsEnabled = true
	}

	private setupTexts = () => {
		this.guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
			'UI',
			true,
			this.scene,
		)
		this.scoreText = new BABYLON.GUI.TextBlock()
		this.scoreText.text = `${this.playerNames.p1}        ${this.scores.p1} : ${this.scores.p2}        ${this.playerNames.p2}`
		this.scoreText.color = 'blue'
		this.scoreText.fontSize = 40
		this.scoreText.top = `-${ARENA_HEIGHT / 2 - 24}px`
		this.scoreText.verticalAlignment =
			BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
		this.scoreText.textHorizontalAlignment =
			BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
		this.scoreText.outlineWidth = 4
		this.scoreText.outlineColor = 'black'
		this.scoreText.shadowColor = 'rgba(211, 174, 236, 0.7)'
		this.scoreText.shadowOffsetX = 2
		this.scoreText.shadowOffsetY = 2
		this.guiTexture.addControl(this.scoreText)

		this.timerText = new BABYLON.GUI.TextBlock()
		this.timerText.color = 'red'
		this.timerText.fontSize = 48
		this.timerText.verticalAlignment =
			BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
		this.timerText.textHorizontalAlignment =
			BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
		this.timerText.isVisible = false
		this.timerText.outlineWidth = 4
		this.timerText.outlineColor = 'black'
		this.timerText.shadowColor = 'rgba(88, 56, 109, 0.7)'
		this.timerText.shadowOffsetX = 2
		this.timerText.shadowOffsetY = 2
		this.guiTexture.addControl(this.timerText)

		this.gameOverText = new BABYLON.GUI.TextBlock()
		this.gameOverText.color = 'red'
		this.gameOverText.fontSize = 48
		this.gameOverText.verticalAlignment =
			BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
		this.gameOverText.textHorizontalAlignment =
			BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
		this.gameOverText.isVisible = false
		this.gameOverText.outlineWidth = 4
		this.gameOverText.outlineColor = 'black'
		this.gameOverText.shadowColor = 'rgba(61, 38, 77, 0.7)'
		this.gameOverText.shadowOffsetX = 2
		this.gameOverText.shadowOffsetY = 2
		this.guiTexture.addControl(this.gameOverText)
	}

	clear() {
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

	onTick(data: State): void {
		super.onTick(data)
	}
	onRoundEnd(data: RoundData) {
		super.onRoundEnd(data)
		this.scoreText.text = `${this.playerNames.p1}        ${this.scores.p1} : ${this.scores.p2}        ${this.playerNames.p2}`
	}
	onGameEnd(data: GameOverData) {
		super.onGameEnd(data)
		this.scoreText.text = `${this.playerNames.p1}        ${this.scores.p1} : ${this.scores.p2}        ${this.playerNames.p2}`
		const winner =
			this.scores.p1 > this.scores.p2
				? this.playerNames.p1
				: this.playerNames.p2
		this.gameOverText.isVisible = true
		this.gameOverText.text = `GAME OVER\n${winner} won !`
	}
	onCollision(data: Collision): void {
		Graphics.handleCollision(
			data,
			this.ballMesh,
			this.paddle1,
			this.paddle2,
			this.scene,
			this.camera,
			this.wallParticleSystem,
		)
	}
	onTimerTick(data: number) {
		if (data === 0) {
			this.timerText.isVisible = false
		} else {
			this.timerText.isVisible = true
			this.timerText.text = `${data}`
		}
	}
	onEngineStart() {}
}
