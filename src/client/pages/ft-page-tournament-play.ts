import { type CleanEffect, createEffect } from '../utils/signal.js'
import { $tournament } from '../utils/store.js'

customElements.define(
	'ft-page-tournament-play',
	class extends HTMLElement {
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				const tournament = $tournament.get()
				console.log(tournament)
				this.innerHTML = /*html*/ `
					<pre>${JSON.stringify(tournament, null, 4)}</pre>	
				`
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
		}
	},
)
