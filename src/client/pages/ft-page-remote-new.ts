customElements.define(
	'ft-page-remote-new',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Versus settings</h2>
                </div>
				<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form action="/remote/new" method="post" class="space-y-6">
						<div>
							<label for="points-to-win">Point to win:</label>
							<input type="range" id="points-to-win" min="1" max="10" value="3">
							<span id="points-to-win-info">3</span>
						</div>
                        <input class="btn btn-border" type="submit" id="submit-button" value="Create">
                    </form>
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
