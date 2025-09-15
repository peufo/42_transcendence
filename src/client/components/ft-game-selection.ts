import { myRendering, setMyRendering } from '../renderer/Renderer.js'
import { $user } from '../utils/store.js'

customElements.define(
	'ft-game-selection',
	class extends HTMLElement {
		connectedCallback() {
			const user = $user.get()
			let activeTournamentButton = ''
			if (user?.tournament)
				activeTournamentButton = /*html*/ `
				<a href="/tournament/play?tournamentId=${user.tournament.id}" class="btn btn-primary col-span-2">
					<ft-icon name="rotate-cw" class="h-5 w-5 mr-1"></ft-icon>
					Return to tournament
				</a>`

			this.innerHTML = /*html*/ `
				<div class="grid grid-cols-2 gap-3">
					<label class="inline-flex items-center cursor-pointer col-span-2 flex flex-row items-center justify-center">
						<input id="renderer" type="checkbox" class="sr-only peer" ${myRendering === '3D' ? 'checked' : ''}>
						<div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
						<span class="ms-3 text-sm" id="render-type">${myRendering}</span>
					</label>
					<div class="flex flex-col gap-5 p-5 justify-evenly ring-2 ring-indigo-500 rounded-lg">
						<div class="text-center">Local</div>
						<a  href="/local/new" class="btn btn-primary">
							<ft-icon name="swords" class="h-5 w-5 mr-1"></ft-icon>
							Versus
						</a>
					</div>
					<div class="flex flex-col gap-5 p-5 justify-evenly ring-2 ring-indigo-500 rounded-lg">
						<div class="text-center">Remote</div>
						<a href="/tournament/new" class="btn btn-primary">
							<ft-icon name="trophy" class="h-5 w-5 mr-1"></ft-icon>
							Create tournament
						</a>
					</div>
					${activeTournamentButton}
				</div>
			`

			const rendererCheckbox = this.querySelector<HTMLInputElement>('#renderer')
			const renderSpan = this.querySelector<HTMLSpanElement>('#render-type')
			if (!rendererCheckbox || !renderSpan) return
			rendererCheckbox.addEventListener('click', () => {
				const selection = rendererCheckbox.checked ? '3D' : '2D'
				setMyRendering(selection)
				renderSpan.innerHTML = selection
			})
		}
	},
)
