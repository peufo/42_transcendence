import { UserBasic } from '../../lib/type.js'
import { createEffect } from '../utils/signal.js'
import { getMatches, getUser } from '../utils/store.js'

customElements.define(
	'ft-page-stats',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
			<div class="grid grid-cols-2 gap gap-4 p-10">
				<ft-match-history></ft-match-history>
				<ft-winrate></ft-winrate>
				<ft-goal-distribution></ft-goal-distribution>
				<ft-ranking></ft-ranking>
			</div>
			`
		}
	},
)

customElements.define(
	'ft-match-history',
	class extends HTMLElement {
		connectedCallback() {
			this.classList.add('flex', 'flex-col', 'gap-3', 'border', 'border-gray-200', 'rounded-xl', 'p-5')
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			const user = getUser()
			const matches = getMatches()
			let adversary: UserBasic
			let html = `
			<h2 class="flex p-2 items-center gap-2">
					Recent matches
				</h2>`

			if (!matches) html += 'No recent matches can be found'
			else {
				for (const match of matches) {
					if (match.player1.id === user?.id) adversary = match.player2
					else adversary = match.player1
					html += /*html*/ `
							<div class="flex pl-4 p-2 items-center gap-2 border border-gray-200 rounded-xl">
								<span> Against </span>
								<img src="${getAvatarSrc(adversary)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
								<span>${adversary.name}</span>
								<div class="flex-grow"></div>
							</div>
						`
				}
			}
			return html
		}
	},
)

customElements.define(
	'ft-ranking',
	class extends HTMLElement {
		connectedCallback(){
			this.classList.add('flex', 'flex-col', 'gap-3', 'border', 'border-gray-200', 'rounded-xl', 'p-5')
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			let html = `
			<h2 class="flex p-2 items-center gap-2">
					Ranking
				</h2>`
			return html
		},
	}
)

customElements.define(
	'ft-winrate',
	class extends HTMLElement {
		connectedCallback(){
			this.classList.add('flex', 'flex-col', 'gap-3', 'border', 'border-gray-200', 'rounded-xl', 'p-5')
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			let html = `
			<h2 class="flex p-2 items-center gap-2">
					Winrate
				</h2>`
			return html
		},
	}
)

customElements.define(
	'ft-goal-distribution',
	class extends HTMLElement {
		connectedCallback(){
			this.classList.add('flex', 'flex-col', 'gap-3', 'border', 'border-gray-200', 'rounded-xl', 'p-5')
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			let html = `
			<h2 class="flex p-2 items-center gap-2">
					Goal distribution
				</h2>`
			return html
		},
	}
)

function getAvatarSrc(user: UserBasic): string {
	if (user.avatar) {
		return user.avatar
	}
	return user.avatarPlaceholder
}
