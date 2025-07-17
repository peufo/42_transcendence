import type { Match, UserBasic } from '../../lib/type.js'
import { createEffect } from '../utils/signal.js'
import { $matches, $user } from '../utils/store.js'

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
					<div class="grid grid-cols-2 gap gap-4 p-10">
						<div class="flex flex-col"><ft-winrate></ft-winrate></div>
						<div class="flex flex-col"><ft-ranking></ft-ranking></div>
						<div class="flex flex-col"><ft-match-history></ft-match-history></div>
						<div class="flex flex-col"><ft-goal-distribution></ft-goal-distribution></div>
					</div>
				`
			else userContent += /*html*/ 'No stats can be shown while logged out.'
			return userContent
		}
	},
)

customElements.define(
	'ft-match-history',
	class extends HTMLElement {
		connectedCallback() {
			this.classList.add(
				'flex',
				'flex-col',
				'gap-3',
				'border',
				'border-gray-200',
				'rounded-xl',
				'p-5',
			)
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			const matches = $matches.get()
			const matchesHead = matches.slice(0, 5)
			const user = $user.get()
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
		connectedCallback() {
			this.classList.add(
				'flex',
				'flex-col',
				'gap-3',
				'border',
				'border-gray-200',
				'rounded-xl',
				'p-5',
			)
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			const user = $user.get()
			if (!user) return ''
			const html = /*html*/ `<h2 class="flex flex-row p-2 items-center justify-center gap-2">Ranking</h2>`
			return html
		}
	},
)

customElements.define(
	'ft-winrate',
	class extends HTMLElement {
		connectedCallback() {
			this.classList.add(
				'flex',
				'flex-row',
				'items-center',
				'justify-center',
				'gap-3',
				'border',
				'border-gray-200',
				'rounded-xl',
				'p-5',
			)
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			const user = $user.get()
			if (!user) return ''
			const userMatches = $matches.get()
			const winRate = (
				(getNumberOfWin(userMatches, user) / userMatches.length) *
				100
			).toPrecision(3)
			const averageRally = getAverageRally(userMatches).toPrecision(2)
			const html = `
			<div class="grid grid-flow-col grid-rows-2 gap-2">
				<h2 class="flex flex-row p-2 items-center justify-center gap-2">Winrate</h2>
				<span class="flex flex-row p-2 items-center justify-center gap-2">${winRate} %</span>
				<h2 class="flex flex-row p-2 items-center justify-center gap-2">Average rally per round</h2>
				<span class="flex flex-row p-2 items-center justify-center gap-2">${averageRally}</span>
			</div>`
			return html
		}
	},
)

customElements.define(
	'ft-goal-distribution',
	class extends HTMLElement {
		connectedCallback() {
			this.classList.add(
				'flex',
				'flex-col',
				'flex-wrap',
				'overflow-hidden',
				'items-center',
				'justify-around',
				'gap-3',
				'border',
				'border-gray-200',
				'rounded-xl',
				'p-5',
			)
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			const matches = $matches.get()
			const user = $user.get()
			if (!user) return ''
			const goalTakenY = getGoalTakenY(matches, user)
			const distributionPercentage = convertToPercentage(goalTakenY)
			const html = `
			<h2 class="flex flex-row p-2 items-center justify-center gap-2">Weaknesses</h2>
			<div class="flex flex-col w-max items-center justify-center ps-1 pb-1 gap-4 border-black border-l-2 border-r-2 border-b-2">
				<div class="w-50 h-5 border-2 border-black rounded-4xl shadow-lg"></div>
				${drawRectangle(distributionPercentage)}
			</div`
			return html
		}
	},
)

function drawRectangle(values: number[]): string {
	let html = '<div class="flex items-center">'
	for (const value of values) {
		const color = `rgb(255, ${255 - Math.ceil((value * 255) / 100)}, ${255 - Math.ceil((value * 255) / 100)})`
		html += `
		<div class="w-1 h-1" style="background-color:${color}"></div>
		`
	}
	html += '</div>'
	return html
}

function getGoalTakenY(matches: Match[], user: UserBasic): number[] {
	const goalTakenY: number[] = []
	for (const match of matches) {
		for (const round of match.rounds) {
			if (
				(match.player1Id === user.id && round.scorer === 'p2') ||
				(match.player2Id === user.id && round.scorer === 'p1')
			)
				goalTakenY.push(round.ballPositionY)
		}
	}
	return goalTakenY
}

function getAverageRally(matches: Match[]): number {
	let roundCount = 0
	let rallyCount = 0
	for (const match of matches) {
		for (const round of match.rounds) {
			rallyCount += round.rallyCount
			roundCount++
		}
	}
	return rallyCount / roundCount
}

function getNumberOfWin(matches: Match[], user: UserBasic): number {
	let win = 0
	for (const match of matches) {
		if (match.player1Score === null || match.player2Score === null) continue
		if (match.player1Id === user.id && match.player1Score > match.player2Score)
			win++
		else if (
			match.player2Id === user.id &&
			match.player2Score > match.player1Score
		)
			win++
	}
	return win
}

function getAvatarSrc(user: UserBasic): string {
	if (user.avatar) {
		return user.avatar
	}
	return user.avatarPlaceholder
}
