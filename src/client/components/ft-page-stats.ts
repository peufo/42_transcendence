import { createEffect } from '../utils/signal.js'
import { getMatches } from '../utils/store.js'

customElements.define(
	'ft-page-stats',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
			<ft-match-history></ft-match-history>
			`
		}
	},
)

customElements.define(
	'ft-match-history',
	class extends HTMLElement {
		connectedCallback() {
			this.classList.add('flex', 'flex-col', 'gap-3')
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			const matches = getMatches()
			let html = ''

			if (!matches) html += 'No recent matches can be found'
			else {
				for (const match of matches) {
					console.log('match', match)
					html += /*html*/ `
							<div class="flex pl-4 p-2 items-center gap-2 border border-gray-200 rounded-xl">
								<span> Match against </span>
								<span>${match.player2Id}</span>
								<div class="flex-grow"></div>
							</div>
						`
				}
			}
			return html
		}
	},
)
