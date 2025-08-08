import type { Match, UserBasic, UserStats } from '../../lib/type.js'
import { getAvatarSrc } from '../utils/avatar.js'
import { createEffect } from '../utils/signal.js'
import { $matches, $rankedUsers, $user } from '../utils/store.js'

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
						<ft-stats></ft-stats>
						<ft-goal-distribution></ft-goal-distribution>
						<ft-match-history></ft-match-history>
						<ft-ranking></ft-ranking>
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

			let html = /*html*/ `
				<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Recent matches</h2>
			`

			if (!matches || matches.length === 0) {
				html += /*html*/ `<div class="flex pl-4 p-2 items-center justify-around gap-2">
					No recent matches can be found.
					</div>`
				return html
			} else {
				for (const match of matchesHead) {
					if (match.player1Score === null || match.player2Score === null)
						continue
					const user1 = /*html*/ `
						<div class="flex p-2 items-center gap-2">
							<img src="${getAvatarSrc(match.player1)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
							<span>${match.player1.name}</span>
						</div>
					`
					const user2 = /*html*/ `
						<div class="flex p-2 items-center justify-end gap-2">
							<span>${match.player2.name}</span>
							<img src="${getAvatarSrc(match.player2)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
						</div>
					`

					const userIsPlayer1 = user.id === match.player1Id
					function getScoreClass(playerId: number): string {
						if (playerId !== user?.id) return ''
						if (match.player1Score === null) return ''
						if (match.player2Score === null) return ''
						if (match.player1Score === match.player2Score) return ''
						if (match.player1Score > match.player2Score) {
							if (userIsPlayer1) return 'text-indigo-600 font-bold'
							return 'text-red-400 font-bold'
						}
						if (userIsPlayer1) return 'text-red-400 font-bold'
						return 'text-indigo-600 font-bold'
					}

					const score1 = /*html*/ `
						<span class="${getScoreClass(match.player1Id)}">
							${match.player1Score}
						</span>
					`
					const score2 = /*html*/ `
						<span class="${getScoreClass(match.player2Id)}">
							${match.player2Score}
						</span>
					`

					html += /*html*/ `
						<div class="grid grid-cols-3 pl-4 p-2 items-center justify-center gap-2 border border-gray-200 rounded-xl">
							${user1}
							<div class="flex items-center justify-center gap-4">
								${score1}
								<ft-icon
									name="zap"
									class="mr-1 scale-x-75 rotate-12">
								</ft-icon>
								${score2}
							</div>
							${user2}
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
			const current_user = $user.get()
			if (!current_user) return ''
			let html = /*html*/ `<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Ranking</h2>`
			let rank = 1
			let nameColor = ''
			let user_in_top = false
			const usersRanked = $rankedUsers.get()
			html += /*html*/ `<div class="flex flex-col w-full gap-2">
			 <div class="flex font-semibold text-center">
				<div class="w-1/6 p-2">Rank</div>
				<div class="w-1/6 p-2">Avatar</div>
				<div class="w-2/6 p-2">Name</div>
				<div class="w-2/6 p-2"># Goals</div>
			</div>
			`
			for (const user of usersRanked) {
				if (rank >= 6) {
					if (user.id === current_user.id && rank === 6) {
						html += /*html*/ `
							<div class="flex items-center text-center p-2 border-indigo-500 border-2 rounded-xl">
								<div class="w-1/6 flex flex-row justify-center items-center">
									<div class="flex flex-row w-5 h-5 items-center justify-center rounded-xl"> ${rank} </div>
								</div>
								<div class="w-1/6 flex justify-center items-center">
									<img src="${getAvatarSrc(current_user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
								</div>
								<div class="w-2/6 flex justify-center items-center font-bold">${current_user.name}</div>
								<div class="w-2/6 flex justify-center items-center">${current_user.numberOfGoals}</div>
							</div>
						</div>
						`
						return html
					}
					if (user.id === current_user.id) break
					else {
						rank++
						continue
					}
				}
				const isCurrentUser = user.id === current_user.id
				if (isCurrentUser) {
					nameColor = `font-bold`
					user_in_top = true
				} else {
					nameColor = ''
				}

				html += /*html*/ `
				<div class="flex items-center text-center p-2 border ${isCurrentUser ? 'border-indigo-500 border-2' : 'border-gray-200'}   rounded-xl">
					<div class="w-1/6 flex flex-row justify-center items-center">
						`
				switch (rank) {
					case 1:
						html += /*html*/ `<ft-icon name="trophy" class="mr-1 fill-yellow-500 stroke-black-400"></ft-icon>`
						break
					case 2:
						html += /*html*/ `<ft-icon name="trophy" class="mr-1 fill-zinc-500 stroke-black-400"></ft-icon>`
						break
					case 3:
						html += /*html*/ `<ft-icon name="trophy" class="mr-1 fill-amber-800 stroke-black-400"></ft-icon>`
						break
					default:
						html += /*html*/ `<div class="flex flex-row w-5 h-5 items-center justify-center rounded-xl"> ${rank} </div>`
						break
				}
				html += /*html*/ `
				</div>
					<div class="w-1/6 flex justify-center items-center">
						<img src="${getAvatarSrc(user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
					</div>
					<div class="w-2/6 flex justify-center items-center ${nameColor}">${user.name}</div>
					<div class="w-2/6 flex justify-center items-center">${user.numberOfGoals}</div>
				</div>`
				rank++
			}
			if (!user_in_top) {
				html += /*html*/ `
				<div class="flex items-center justify-center p-2 rounded-xl font-bold">...</div>
				<div class="flex items-center text-center p-2 border-indigo-500 border-2 rounded-xl">
					<div class="w-1/6 flex flex-row justify-center items-center">
						<div class="flex flex-row w-5 h-5 items-center justify-center rounded-xl"> ${rank} </div>
					</div>
					<div class="w-1/6 flex justify-center items-center">
						<img src="${getAvatarSrc(current_user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
					</div>
					<div class="w-2/6 flex justify-center items-center font-bold">${current_user.name}</div>
					<div class="w-2/6 flex justify-center items-center">${current_user.numberOfGoals}</div>
				</div>
				`
			}
			html += `</div>`
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
				'flex-flow',
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
			const getAllUsersStats = $rankedUsers.get()
			if (userMatches.length === 0) {
				const html = /*html*/ `<div class="grid grid-flow-row grid-rows-2 gap-2">
					<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Total match played</h2>
					<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Winrate</h2>
					<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Average rally per round</h2>
					<h2 class="flex col-start-1 col-end-4 row-start-2 row-end-3 flex-row p-2 items-center justify-center text-center gap-2">Not enough matches to calculate statistics.</h2>
				</div>`
				return html
			}
			const winRate = (
				(user.numberOfWin / user.numberOfMatches) *
				100
			).toPrecision(3)
			const averageRally = getAverageRally(userMatches).toPrecision(2)
			const rank = getUserRank(getAllUsersStats, user)
			const leagueImage = getLeagueHtml(getAllUsersStats, rank)

			const pr = new Intl.PluralRules('en-US', { type: 'ordinal' })
			const suffixes = new Map([
				['one', 'st'],
				['two', 'nd'],
				['few', 'rd'],
				['other', 'th'],
			])
			const formatOrdinals = (n: number) => {
				const rule = pr.select(n)
				const suffix = suffixes.get(rule)
				return `${n}${suffix}`
			}
			const html = /*html*/ `
			<div class="grid grid-flow-col grid-rows-2 items-center gap-2">
				<h2 class="p-2 text-center font-bold">Total match played</h2>
				<h2 class="p-2 text-center">${user.numberOfMatches}</h2>
				<h2 class="p-2 text-center font-bold">Total match won</h2>
				<h2 class="p-2 text-center">${user.numberOfWin}</h2>
				<h2 class="p-2 text-center font-bold">Winrate</h2>
				<h2 class="p-2 text-center">${winRate} %</h2>
				<h2 class="p-2 text-center font-bold">Average rally per round</h2>
				<h2 class="p-2 text-center">${averageRally}</h2>
				<h2 class="p-2 text-center font-bold">Rank</h2>
				<h2 class="p-2 text-center">${formatOrdinals(rank)}</h2>
				<div class="flex flex-row justify-center items-center">
					<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">League</h2>
					<div class="flex flex-row justify-center items-center relative group">
						<ft-icon name="message-circle-question" class="mr-1"></ft-icon>
						${getLeagueModal()}
					</div>
				</div>
				${leagueImage}
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
			const user = $user.get()
			if (!user) return ''
			const matches = $matches.get()
			if (matches.length === 0) {
				const html = /*html*/ `
					<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Weaknesses</h2>
					<div class="flex pl-4 p-2 items-center justify-around gap-2">
					Not enough matches to calculate statistics.
					</div>
				`
				return html
			}
			const goalTakenY = getGoalTakenY(matches, user)
			const distributionPercentage = convertToPercentage(goalTakenY)
			const html = /*html*/ `
				<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Weaknesses</h2>
				<div class="flex flex-col w-max items-center justify-center pl-1 pr-1 pb-1 gap-4 border-black border-l-2 border-r-2 border-b-2">
					<div class="w-50 h-5 border-2 border-black rounded-4xl shadow-lg"></div>
					${drawRectangle(distributionPercentage)}
				</div>
			`
			return html
		}
	},
)

function drawRectangle(values: number[]): string {
	let html = '<div class="flex items-center">'
	const maxValue = Math.max(...values)
	for (const value of values) {
		const color = `rgb(${255 - Math.floor((value * 255) / maxValue)}, ${255 - Math.floor((value * 255) / maxValue)}, 255)`
		html += /*html*/ `
		<div class="w-1 h-4" style="background-color:${color}"></div>
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

function getUserRank(usersStats: UserStats[], user: UserBasic): number {
	let rank = 1
	for (const userstat of usersStats) {
		if (userstat.id === user.id) break
		rank++
	}
	return rank
}

type League = { name: string; color: string; icon: string; threshold: number }
const leagues: League[] = [
	{ name: 'Summit', color: '#CC04A6', icon: 'mountain', threshold: 2 },
	{ name: 'Ruby', color: '#E0115F', icon: 'diamond', threshold: 10 },
	{ name: 'Storm', color: '#04B1C9', icon: 'tornado', threshold: 30 },
	{ name: 'Mist', color: '#C9D6DF', icon: 'cloud', threshold: 60 },
	{ name: 'Bud', color: '#7AC74F', icon: 'sprout', threshold: 100 },
] as const

function getLeagueHtml(usersStats: UserStats[], userRank: number): string {
	const percentage = (userRank / usersStats.length) * 100
	const league =
		leagues.find(({ threshold }) => percentage < threshold) ||
		leagues[leagues.length - 1]
	const leagueDiv = getLeagueDiv(league)
	return leagueDiv
}

function getLeagueDiv(league: League): string {
	let styling = ''
	if (league.name === 'Storm') styling = `style="stroke:${league.color};"`
	else styling = `style="fill:${league.color}; stroke: black;"`
	const leagueIconDiv = /*html*/ `
		<ft-icon
			name="${league.icon}"
			class="mr-1 h-10 w-10" ${styling}>
		</ft-icon>
	`
	const leagueNameDiv = /*html*/ `
		<span class="font-bold text-2xl" style="color:${league.color}">
			${league.name}
		</span>
	`
	const leaguediv = /*html*/ `
		<div class="flex flex-col justify-center items-center gap-4">
			${leagueNameDiv}
			${leagueIconDiv}
		</div>
	`
	return leaguediv
}

function getLeagueModal(): string {
	const leagueListElements = leagues
		.map((league, index) => {
			let styling = ''
			if (league.name === 'Storm') styling = `style="stroke:${league.color};"`
			else styling = `style="fill:${league.color}; stroke: black;"`
			console.log(styling)
			const content = /*html*/ `
				<div class="flex flex-col p-2 items-center justify-center text-center gap-2">
					<span class="font-bold" style="color:${league.color}">${league.name}</span>
					<ft-icon
						name="${league.icon}"
						class="mr-1" ${styling}>
					</ft-icon>
					<div class="font-bold whitespace-nowrap" style="color: ${league.color};">Top ${league.threshold} %</div>
				</div>
			`
			if (index > 0)
				return `${content}<ft-icon name="arrow-right" class="fill-black-400"></ft-icon>`
			return content
		})
		.reverse()
		.join('')
	const leagueList = /*html*/ `
		<div class="flex flex-row justify-center items-center">
			${leagueListElements}
		</div>
		`

	const modal = /*html*/ `
		<div class="absolute left-1/2 top-full transform -translate-x-1/2 p-4 border border-gray-400 rounded-2xl bg-white shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-10 flex justify-center items-center">
			${leagueList}
		</div>
	`
	return modal
}
