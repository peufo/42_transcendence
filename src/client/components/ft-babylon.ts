import {
  Engine as GameEngine,
  type State,
  ARENA_WIDTH,
  ARENA_HEIGHT,
} from '../../lib/engine/index.js'

import { createCamera } from '../graphics/camera.js'
import { createLights } from '../graphics/lights.js'
import {
  createPaddleMaterial,
  createMatwall,
  createBallMaterial,
} from '../graphics/materials.js'
import { createArena } from '../graphics/arena.js'
import { createPaddles } from '../graphics/paddles.js'
import { createBall } from '../graphics/ball.js'
import { toRenderPosition } from '../graphics/utils.js'
import { updateGraphics } from '../graphics/scene.js'

declare const BABYLON: any

customElements.define(
  'ft-babylon',
  class extends HTMLElement {
    canvas: HTMLCanvasElement
    babylonEngine: BABYLON.Engine
    scene: BABYLON.Scene
    camera: BABYLON.FreeCamera
    light: BABYLON.HemisphericLight
    ballMesh: BABYLON.Mesh
    paddle1: BABYLON.Mesh
    paddle2: BABYLON.Mesh
    gameLogicEngine: GameEngine

    constructor() {
      super()
      this.classList.add('w-full', 'h-full')

      this.initCanvasAndEngine()
      this.setupScene()
      this.createGameObjects()
      this.setupVisualEffects()
      this.setupShadows()
      this.startGameEngine()
      this.setupControls()

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

      this.babylonEngine = new BABYLON.Engine(this.canvas, true, { stencil: true })
      this.scene = new BABYLON.Scene(this.babylonEngine)
      this.scene.clearColor = new BABYLON.Color3(0.6, 1, 0.8)
      this.scene.lightsEnabled = true
      this.scene.ambientColor = new BABYLON.Color3(0.7, 0.7, 0.7)
    }

    setupScene() {
      this.camera = createCamera(this.scene, this.canvas)
      this.light = createLights(this.scene)

      const pipeline = new BABYLON.DefaultRenderingPipeline('defaultPipeline', true, this.scene, [this.camera])
      pipeline.bloomEnabled = true
      pipeline.bloomIntensity = 1
      pipeline.imageProcessingEnabled = true
      pipeline.fxaaEnabled = true
      }

    createGameObjects() {
      const wallMaterial = createMatwall(this.scene)
      const paddleMaterial = createPaddleMaterial(this.scene)
      const ballMaterial = createBallMaterial(this.scene)

      createArena(this.scene, wallMaterial, ARENA_WIDTH, ARENA_HEIGHT)

      const paddles = createPaddles(this.scene, paddleMaterial, ARENA_WIDTH, ARENA_HEIGHT)
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

    startGameEngine() {
      this.gameLogicEngine = new GameEngine(this.renderGameState.bind(this))
      this.gameLogicEngine.startGame()
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
  }
)

