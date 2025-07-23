import { eventBus } from '../utils/eventBus.js'

customElements.define(
	'ft-page-babylon-menu',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
        <ft-babylon-menu></ft-babylon-menu>
        <div class="flex items-center justify-center bg-gray-100 p-7">
          <div id="menu" class="flex flex-col items-center justify-start w-[400px] h-[400px] bg-gray-300 p-4 gap-6 shadow-lg rounded">
            <p class="text-2xl font-bold text-gray-800">MENU</p>

            <button data-type="skybox" class="bg-green-700 text-white font-semibold px-4 py-2 rounded hover:bg-green-800">
              Skybox
            </button>

            <button data-type="paddle" class="bg-green-700 text-white font-semibold px-4 py-2 rounded hover:bg-green-800">
              Paddle
            </button>
          </div>
        </div>
      `

			customElements.whenDefined('ft-babylon-menu').then(() => {
				type GraphicKey = 'skybox' | 'paddle'

				const options: Record<GraphicKey, string[]> = {
					skybox: ['cloud8k', 'garden8k', 'shanghai_16k'],
					paddle: ['Megaphone1', 'Croissant1'],
				}

				const currentIndex: Record<GraphicKey, number> = {
					skybox: 0,
					paddle: 0,
				}

				interface Item {
					newType: string
					name: string
				}
				const menu = this.querySelector('#menu')
				menu?.addEventListener('click', (event) => {
					const target = event.target as HTMLElement

					if (target.tagName !== 'BUTTON') return

					const type = target.dataset.type as GraphicKey | undefined
					if (!type || !(type in options)) return

					const index = currentIndex[type]
					console.log("ceci est l'index?", index)
					const currentItem = options[type][index]

					console.log(`[${type}] Actuel :`, currentItem)

					currentIndex[type] = (index + 1) % options[type].length

					const nextItem = options[type][currentIndex[type]]
					console.log(`[${type}] Suivant :`, nextItem)
					//eventBus.publish("changeScene", nextItem)

					const nextItemstosend: Item = {
						newType: type,
						name: nextItem,
					}
					eventBus.publish('Scenechange', nextItemstosend)
				})
			})
		}
	},
)
