import { goto } from '../components/ft-router.js'

customElements.define(
	'ft-page-local-new',
	class extends HTMLElement {
		connectedCallback() {
			const player1Default = 'Player 1'
			const player2Default = 'Player 2'
			const pointsToWinDefault = '3'

			this.innerHTML = /*html*/ `
                <div class="max-w-lg m-auto flex flex-col gap-6 ring-2 ring-indigo-500 rounded-lg mt-5 p-5">
                    <div>
                        <h1 class="flex flex-row justify-center items-center font-bold mb-5">Game settings</h1>
                        <form id="local-form" class="grid grid-cols-[1fr,2fr] gap-5">
							<label for="player-1-name" class="whitespace-nowrap flex flex-row items-center">Player 1</label>
							<input name="player-1-name" type="text" placeholder="${player1Default}" maxlength="24"
								class="input rounded-lg px-4 py-2 text-white bg-white/10 backdrop-blur-md placeholder-white/60 focus:outline-offset-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-blue-900 transition duration-300 ">
							<label for="player-2-name" class="whitespace-nowrap flex flex-row items-center">Player 2</label>
							<input name="player-2-name" type="text" placeholder="${player2Default}" maxlength="24"
								class="input rounded-lg px-4 py-2 text-white bg-white/10 backdrop-blur-md placeholder-white/60 focus:outline-offset-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-blue-900 transition duration-300 ">
							<label for="points-to-win" class="flex flex-row items-center">Points to win</label>
							<div class="flex flex-row justify-center items-center gap-5">
								<input name="points-to-win" type="range" id="points-to-win" min="1" max="10" value="3" class="text-center">
								<span class="h-auto w-15" id="points-to-win-info"></span>
							</div>
							<input class="btn btn-border col-span-2" type="submit" id="submit-button" value="Play">
                        </form>
                    </div>
					
					<div class="flex flex-col justify-center items-center gap-2">
						<div>Player 1 (L): Use W/S or A/D to move.</div>
						<div>Player 2 (R): Use I/K or J/L to move.</div>
					</div>
                </div>
			`

			const pointsToWin: HTMLInputElement | null =
				this.querySelector('#points-to-win')
			const pointsToWinInfo: HTMLSpanElement | null = this.querySelector(
				'#points-to-win-info',
			)
			if (!pointsToWin || !pointsToWinInfo) return
			pointsToWinInfo.textContent = pointsToWin.value
			pointsToWin.addEventListener('input', () => {
				pointsToWinInfo.textContent = pointsToWin.value
			})

			this.querySelector('#local-form')?.addEventListener('submit', (e) => {
				e.preventDefault()
				e.stopPropagation()
				const form = e.target as HTMLFormElement
				const formData = new FormData(form)
				const url = new URL('play', document.baseURI)
				const params = new URLSearchParams()
				params.set(
					'player1',
					formData.get('player-1-name')?.toString() || player1Default,
				)
				params.set(
					'player2',
					formData.get('player-2-name')?.toString() || player2Default,
				)
				params.set(
					'points-to-win',
					formData.get('points-to-win')?.toString() || pointsToWinDefault,
				)
				url.search = params.toString()
				goto(url)
			})
		}
	},
)
