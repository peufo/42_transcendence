import { UserBasic, Match } from '../../lib/type.js'
import { createEffect } from '../utils/signal.js'
import { getMatches, getUser } from '../utils/store.js'

customElements.define(
	'ft-page-stats',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = this.render()
		}
		render(): string {
			const user = getUser()

			let userContent = ''
			if (user)
				userContent += /*html*/`
					<div class="grid grid-cols-2 gap gap-4 p-10">
						<ft-winrate></ft-winrate>
						<ft-ranking></ft-ranking>
						<ft-match-history></ft-match-history>
						<ft-goal-distribution></ft-goal-distribution>
					</div>
				`
			else
				userContent += /*html*/'No stats can be shown while logged out.'
			return userContent
		}
	}
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
			const matches = getMatches()
			const matchesHead = matches.slice(0, 5)
			const user = getUser()
			let adversary: UserBasic
			let html = `
			<h2 class="flex flex-row p-2 items-center justify-center gap-2">Recent matches</h2>`

			if (!matches) html += 'No recent matches can be found'
			else {
				for (const match of matchesHead) {
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
			<h2 class="flex flex-row p-2 items-center justify-center gap-2">Ranking</h2>`
			return html
		},
	}
)

customElements.define(
	'ft-winrate',
	class extends HTMLElement {
		connectedCallback(){
			this.classList.add('flex', 'flex-row', 'items-center', 'justify-center', 'gap-3', 'border', 'border-gray-200', 'rounded-xl', 'p-5')
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			const user = getUser()
			if (!user)
				return ''
			const matches = getMatches()
			const winRate = ((getNumberOfWin(matches, user) / matches.length) * 100).toPrecision(3)
			let html = `
			<div class="grid grid-flow-col grid-rows-2 gap-2">
				<h2 class="flex flex-row p-2 items-center justify-center gap-2">Winrate</h2>
				<span class="flex flex-row p-2 items-center justify-center gap-2">${winRate}</span>
				<h2 class="flex flex-row p-2 items-center justify-center gap-2">Average rally per round</h2>
				<span class="flex flex-row p-2 items-center justify-center gap-2">${getAverageRally(matches)}</span>
			</div>`
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
			const user = getUser()
			if (!user)
				return ''
			let html = `
			<h2 class="flex flex-row p-2 items-center justify-center gap-2">Goal distribution</h2>`
			return html
		},
	}
)

function getAverageRally(matches: Match[])
{
	return 0
}

function getNumberOfWin(matches: Match[], user: UserBasic): number {
	let win = 0
	for (const match of matches)
	{
		if (match.player1Id === user.id && match.player1Score > match.player2Score)
			win++;
		else if (match.player2Id === user.id && match.player2Score > match.player1Score)
			win++;
	}
	return (win)
}

function getAvatarSrc(user: UserBasic): string {
	if (user.avatar) {
		return user.avatar
	}
	return user.avatarPlaceholder
}
