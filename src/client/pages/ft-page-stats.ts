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
						<div class="flex flex-col"><ft-stats></ft-winrate></div>
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
			if (!user) return ''
			let adversary: UserBasic
			let html = /*html*/ `
				<h2 class="flex flex-row p-2 items-center justify-center gap-2">Recent matches</h2>
			`

			if (!matches) html += 'No recent matches can be found'
			else {
				for (const match of matchesHead) {
					if (match.player1Score === null || match.player2Score === null)
						continue
					html += /*html*/ `
					<div class="flex pl-4 p-2 items-center justify-around gap-2 border border-gray-200 rounded-xl">
						<div class="flex p-2 items-center gap-2">
							<img src="${getAvatarSrc(match.player1)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
							<span class="flex items-center gap-2"> ${match.player1.name}</span>
						</div>`
					if (match.player1Id === user.id) {
						if (match.player1Score > match.player2Score)
							html += `<span class="flex items-center gap-2 text-green-400"> ${match.player1Score}</span>`
						else
							html += `<span class="flex items-center gap-2 text-red-400"> ${match.player1Score}</span>`
					} else {
						html += `<span class="flex items-center gap-2"> ${match.player1Score}</span>`
					}
					html += `<span class="flex items-center gap-2"> VS </span>`
					if (match.player2Id === user.id) {
						if (match.player2Score > match.player1Score)
							html += `<span class="flex items-center gap-2 text-red-400"> ${match.player2Score}</span>`
						else
							html += `<span class="flex items-center gap-2 text-green-400"> ${match.player2Score}</span>`
					} else {
						html += `<span class="flex items-center gap-2"> ${match.player2Score}</span>`
					}
					html += `
						<div class="flex p-2 items-center gap-2">
							<span class="flex items-center gap-2"> ${match.player2.name}</span>
							<img src="${getAvatarSrc(match.player2)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
						</div>
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
			const html = /*html*/ `
			<h2 class="flex flex-row p-2 items-center justify-center gap-2">Ranking</h2>
			<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2"></h2>`
			return html
		}
	},
)

customElements.define(
	'ft-stats',
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
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">Total match played</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${userMatches.length}</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">Winrate</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${winRate} %</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">Average rally per round</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${averageRally}</h2>
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
			<div class="flex flex-col w-max items-center justify-center pl-1 pr-1 pb-1 gap-4 border-black border-l-2 border-r-2 border-b-2">
				<div class="w-50 h-5 border-2 border-black rounded-4xl shadow-lg"></div>
				${drawRectangle(distributionPercentage)}
			</div`
			return html
		}
	},
)

function drawRectangle(values: number[]): string {
	let html = '<div class="flex items-center">'
	const maxValue = Math.max(...values)
	for (const value of values) {
		const color = `rgb(255, ${255 - Math.floor((value * 255) / maxValue)}, ${255 - Math.floor((value * 255) / maxValue)})`
		html += `
		<div class="w-1 h-1" style="background-color:${color}"></div>
		`
	}
	html += '</div>'
	return html
}

function convertToPercentage(goalTakenY: number[]): number[] {
	const distribution: number[] = []
	let correctedDistribution: number[] = []
	for (let i = 0; i < 100; i++) distribution.push(0)
	for (const value of goalTakenY) distribution[value]++
	correctedDistribution = distribution.map((e) => (e * 100) / goalTakenY.length)
	return correctedDistribution
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
