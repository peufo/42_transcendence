customElements.define(
	'ft-page-local-new',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <div class="max-w-lg m-auto flex flex-col gap-6 ring-2 ring-indigo-500 rounded-lg mt-5 p-5">
                    <div>
                        <h1 class="flex flex-row justify-center items-center font-bold mb-5">Game settings</h1>
                        <form id="local-form" class="grid grid-cols-3 gap-2">
                                <label for="player-1-name" class="whitespace-nowrap">Player 1:</label>
                                <input class="col-span-2 input rounded-lg px-4 py-2 text-white bg-white/10 backdrop-blur-md placeholder-white/60 focus:outline-offset-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-blue-900 transition duration-300 " type="text" id="player-1-name" placeholder="Player 1" maxlength="24" required>
                                <label for="player-2-name" class="whitespace-nowrap">Player 2:</label>
                                <input class="col-span-2 input rounded-lg px-4 py-2 text-white bg-white/10 backdrop-blur-md placeholder-white/60 focus:outline-offset-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-blue-900 transition duration-300 " type="text" id="player-2-name" placeholder="Player 2" maxlength="24" required>
                                <label for="points-to-win">Point to win:</label>
                                <input type="range" id="points-to-win" min="1" max="10" value="3" class="text-center">
                                <span id="points-to-win-info">3</span>
                            <input class="btn btn-border col-span-3" type="submit" id="submit-button" value="Play">
                        </form>
                    </div>


                    <div>
                        <a href="/local/play/babylon" class="btn btn-border">
                            <span> Play versus Babylon version </span>
                        </a >
                    </div>
					<div class="flex flex-col justify-center items-center gap-2">
						<div>Player 1: Use "W" and "S" to move.</div>
						<div>Player 2: User "I" and "K" to move.</div>
					</div>
                </div>
			`

			const pointsToWin: HTMLInputElement | null =
				this.querySelector('#points-to-win')
			const pointsToWinInfo: HTMLSpanElement | null = this.querySelector(
				'#points-to-win-info',
			)
			if (!pointsToWin || !pointsToWinInfo) return
			pointsToWin.addEventListener('input', () => {
				pointsToWinInfo.textContent = pointsToWin.value
			})

			this.querySelector('#submit-button')?.addEventListener('click', (e) => {
				e.preventDefault()
				const player1: HTMLInputElement | null =
					this.querySelector('#player-1-name')
				const player2: HTMLInputElement | null =
					this.querySelector('#player-2-name')

				if (player1 && player2) {
					// Encode the text for URL safety
					const encodedPlayer1 = encodeURIComponent(player1?.value)
					const encodedPlayer2 = encodeURIComponent(player2?.value)
					const encodedpointsToWin = encodeURIComponent(pointsToWin?.value)

					window.location.href = `play?player1=${encodedPlayer1}&player2=${encodedPlayer2}&scoreToWin=${encodedpointsToWin}`
				}
			})
		}
	},
)
