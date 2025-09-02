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
						<div class="flex flex-col justify-between">
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

customElements.define(
	'ft-match-history',
	class extends HTMLElement {
		private user = $user.get()

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
			if (!this.user) return ''

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
					if (
						!match.player1 ||
						!match.player2 ||
						!match.player1Id ||
						!match.player2Id
					)
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

					const userIsPlayer1 = this.user.id === match.player1Id
					const getScoreClass = (playerId: number): string => {
						if (playerId !== this.user?.id) return ''
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
		private user = $user.get()

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
			if (!this.user) return ''
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
			for (const userRanked of usersRanked) {
				if (rank >= 6) {
					if (userRanked.id === this.user.id && rank === 6) {
						html += /*html*/ `
							<div class="flex items-center text-center p-2 border-indigo-500 border-2 rounded-xl">
								<div class="w-1/6 flex flex-row justify-center items-center">
									<div class="flex flex-row w-5 h-5 items-center justify-center rounded-xl"> ${rank} </div>
								</div>
								<div class="w-1/6 flex justify-center items-center">
									<img src="${getAvatarSrc(this.user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
								</div>
								<div class="w-2/6 flex justify-center items-center font-bold">${this.user.name}</div>
								<div class="w-2/6 flex justify-center items-center">${this.user.numberOfGoals}</div>
							</div>
						</div>
						`
						return html
					}
					if (userRanked.id === this.user.id) break
					else {
						rank++
						continue
					}
				}
				const isCurrentUser = userRanked.id === this.user.id
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
						<img src="${getAvatarSrc(userRanked)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
					</div>
					<div class="w-2/6 flex justify-center items-center ${nameColor}">${userRanked.name}</div>
					<div class="w-2/6 flex justify-center items-center">${userRanked.numberOfGoals}</div>
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
						<img src="${getAvatarSrc(this.user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
					</div>
					<div class="w-2/6 flex justify-center items-center font-bold">${this.user.name}</div>
					<div class="w-2/6 flex justify-center items-center">${this.user.numberOfGoals}</div>
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
		private user = $user.get()

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
			if (!this.user) return ''
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
				(this.user.numberOfWin / this.user.numberOfMatches) *
				100
			).toPrecision(3)
			const averageRally = getAverageRally(userMatches).toPrecision(2)
			const rank = getUserRank(getAllUsersStats, this.user)
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
			<div class="p-4 bg-white rounded-lg md:p-8" id="stats">
				<dl class="grid max-w-screen-xl gap-8 mx-auto text-gray-900 sm:grid-cols-2 xl:grid-cols-3 md:grid-cols-3">
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">${this.user.numberOfMatches}</dt>
						<dd class="text-gray-500 dark:text-gray-400 whitespace-nowrap">Total match played</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">${this.user.numberOfWin}</dt>
						<dd class="text-gray-500 dark:text-gray-400 whitespace-nowrap">Total match won</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">${winRate} %</dt>
						<dd class="text-gray-500 dark:text-gray-400 whitespace-nowrap">Winrate</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">${averageRally}</dt>
						<dd class="text-gray-500 dark:text-gray-400 whitespace-nowrap">Average rally per round</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">${formatOrdinals(rank)}</dt>
						<dd class="text-gray-500 dark:text-gray-400 whitespace-nowrap">Rank</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">
							<div class="flex flex-row justify-center items-center relative group">
								${leagueImage}
							</div>
						</dt>
						<div class="flex flex-row justify-center items-center">
							<dd class="text-gray-500 dark:text-gray-400 whitespace-nowrap">
								League
							</dd>
							<div class="flex flex-row justify-center items-center relative group">
								<ft-icon name="message-circle-question" class="ml-1 mb-5"></ft-icon>
		 						${getLeagueModal()}
							</div>
						</div>
					</div>
				</dl>
			</div>`
			return html
		}
	},
)

customElements.define(
	'ft-goal-received-distribution',
	class extends HTMLElement {
		private user = $user.get()

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
			if (!this.user) return ''
			const matches = $matches.get()
			if (matches.length === 0) {
				const html = /*html*/ `
					<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Most conceded zones</h2>
					<div class="flex pl-4 p-2 items-center justify-around gap-2">
					Not enough matches to calculate statistics.
					</div>
				`
				return html
			}
			const goalTakenY = getGoalTakenY(matches, this.user)
			const distributionPercentage = convertToPercentage(goalTakenY)
			const html = /*html*/ `
				<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Most conceded zones</h2>
				<div class="flex flex-col w-max items-center justify-center pl-1 pr-1 pb-1 gap-4 border-black border-l-2 border-r-2 border-b-2">
					<div class="w-50 h-5 border-2 border-black rounded-4xl shadow-lg"></div>
					${drawRectangle(distributionPercentage, 'conceded')}
				</div>
			`
			return html
		}
	},
)

customElements.define(
	'ft-goal-scored-distribution',
	class extends HTMLElement {
		private user = $user.get()

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
			if (!this.user) return ''
			const matches = $matches.get()
			if (matches.length === 0) {
				const html = /*html*/ `
					<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Best scoring zones</h2>
					<div class="flex pl-4 p-2 items-center justify-around gap-2">
					Not enough matches to calculate statistics.
					</div>
				`
				return html
			}
			const goalTScoredY = getGoalScoredY(matches, this.user)
			const distributionPercentage = convertToPercentage(goalTScoredY)
			const html = /*html*/ `
				<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Best scoring zones</h2>
				<div class="flex flex-col w-max items-center justify-center pl-1 pr-1 pb-1 gap-4 border-black border-l-2 border-r-2 border-t-2">
					${drawRectangle(distributionPercentage, 'scored')}
					<div class="w-50 h-5 border-2 border-black rounded-4xl shadow-lg"></div>
				</div>
			`
			return html
		}
	},
)

function drawRectangle(values: number[], mode: string): string {
	let html = '<div class="flex items-center">'
	const maxValue = Math.max(...values)
	for (const value of values) {
		let color = ''
		if (mode === 'conceded')
			color = `rgb(${255 - Math.floor((value * 255) / maxValue)}, ${255 - Math.floor((value * 255) / maxValue)}, 255)`
		else
			color = `rgb(255, ${255 - Math.floor((value * 255) / maxValue)}, ${255 - Math.floor((value * 255) / maxValue)})`
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

function getGoalScoredY(matches: Match[], user: UserBasic): number[] {
	const goalScoredY: number[] = []
	for (const match of matches) {
		for (const round of match.rounds) {
			if (
				(match.player1Id === user.id && round.scorer === 'p1') ||
				(match.player2Id === user.id && round.scorer === 'p2')
			)
				goalScoredY.push(round.ballPositionY)
		}
	}
	return goalScoredY
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
		<span class="font-bold text-2xl border-" style="color:${league.color}">
			${league.name}
		</span>
	`
	const leaguediv = /*html*/ `
		<div class="flex flex-col justify-center items-center gap-4 rounded-4xl">
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
			let value = ''
			if (index === leagues.length - 1) value = `Starting`
			else value = `Top ${league.threshold} %`
			const content = /*html*/ `
				<div class="flex flex-col p-2 items-center justify-center text-center gap-2">
					<span class="font-bold" style="color:${league.color}">${league.name}</span>
					<ft-icon
						name="${league.icon}"
						class="mr-1" ${styling}>
					</ft-icon>
					<div class="font-bold whitespace-nowrap" style="color: ${league.color};">${value}</div>
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
