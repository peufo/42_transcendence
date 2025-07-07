import { createEffect } from '../utils/signal.js'
import { getMatches } from '../utils/store.js'

customElements.define(
	'ft-page-stats',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
			<ft-matchhistory></ft-matchhistory>
			`
		}
	},
)

customElements.define(
	'ft-matchhistory',
	class extends HTMLElement {
		connectedCallback() {
			this.classList.add('flex', 'flex-col', 'gap-3')
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			const matches = getMatches()

			if (!matches) return 'No recent matches can be found'

			let html = ''
			for (const match of matches) {
				console.log('GO')
				html += /*html*/ `
						<div class="flex pl-4 p-2 items-center gap-2 border border-gray-200 rounded-xl">
							<span>${match.player1Id}</span>
							<span> - </span>
							<span>${match.player2Id}</span>
							<div class="flex-grow"></div>
						</div>
					`
			}
			return html
		}
	},
)
