import { $user } from '../utils/store.js'

customElements.define(
	'ft-page-stats',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = this.render()
		}
		render(): string {
			const user = $user.get()

			let userContent = ''
			if (user)
				userContent += /*html*/ `
					<div class="grid grid-cols-1 lg:grid-cols-2 grid-flow-row gap gap-4 p-10 max-w-7xl mx-auto">
						<ft-overall-stats></ft-overall-stats>
						<div class="flex flex-row justify-between card">
							<ft-goal-received-distribution></ft-goal-received-distribution>
							<ft-goal-scored-distribution><ft-goal-scored-distribution>
						</div>
						<ft-match-history></ft-match-history>
						<ft-ranking></ft-ranking>
					</div>
				`
			else userContent += /*html*/ 'No stats can be shown while logged out.'
			return userContent
		}
	},
)
