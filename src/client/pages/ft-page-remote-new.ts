customElements.define(
	'ft-page-remote-new',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <div class="max-w-lg m-auto flex flex-col gap-6 ring-2 ring-indigo-500 rounded-lg mt-5 p-5">
                    <div>
                        <h1 class="flex flex-row justify-center items-center font-bold mb-5">Game settings</h1>
                        <form id="local-form" class="grid grid-cols-[1fr,2fr] gap-5" action="/remote/new" method="post">
							<label for="points-to-win">Points to win</label>
							<div class="flex flex-row justify-center items-center gap-5">
								<input type="range" id="points-to-win" min="1" max="10" value="3" class="text-center" name="scoreToWin">
								<span class="h-auto w-15" id="points-to-win-info">3</span>
							</div>
							<input class="btn btn-border col-span-2" type="submit" id="submit-button" value="Play">
                        </form>
                    </div>
                    <div>
                        <a href="/local/play/babylon" class="btn btn-border">
                            <span> Play versus Babylon version </span>
                        </a>
                    </div>
					<div class="flex flex-col justify-center items-center gap-2">
						<div>Player 1 (L): Use "W" and "S" to move.</div>
						<div>Player 2 (R): Use "I" and "K" to move.</div>
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
		}
	},
)
