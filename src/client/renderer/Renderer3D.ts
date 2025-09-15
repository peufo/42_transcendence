import type {
	Collision,
	GameOverData,
	RoundData,
	State,
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
	private wallParticleSystem: BABYLON.ParticleSystem

	constructor(element: HTMLElement) {
		super(element)
		this.initAsync()
		window.addEventListener('resize', () => this.babylonEngine.resize())
	}

	private initAsync = async () => {
		try {
			this.initEngine()
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
			this.wallParticleSystem = Graphics.setupWallCollisionParticles(this.scene)
			this.setupScore()
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

	private setupScore = () => {
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
		this.scoreText.text = `${this.scores.p1} : ${this.scores.p2}`
	}
	onGameEnd(data: GameOverData) {
		super.onGameEnd(data)
		this.scoreText.text = `${this.scores.p1} : ${this.scores.p2}`
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
	onTimerTick(_data: number) {}
	onEngineStart() {}
}
