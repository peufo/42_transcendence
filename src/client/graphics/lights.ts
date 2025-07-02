
export function createLights(scene: BABYLON.Scene): BABYLON.DirectionalLight {
  const hemiLight = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 10, 0), scene)
  hemiLight.intensity = 1.5

  const dirLight1 = new BABYLON.DirectionalLight("dirLight1", new BABYLON.Vector3(2, -2, -1), scene)
  dirLight1.position = new BABYLON.Vector3(100, 240, 120)
  dirLight1.intensity = 1.5

  return dirLight1
}

