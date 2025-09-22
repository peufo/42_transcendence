import type { Match, UserBasic, UserStats } from '../../lib/type.js'
import { createEffect } from '../utils/signal.js'
import { $matches, $rankedUsers, $user } from '../utils/store.js'

customElements.define(
	'ft-overall-stats',
	class extends HTMLElement {
		private user = $user.get()

		connectedCallback() {
			this.classList.add(
				'flex',
				'flex-row',
				'flex-flow',
				'items-center',
				'justify-center',
				'card',
				'gap-3',
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
				return `${suffix}`
			}
			const html = /*html*/ `
			<div class="p-4 rounded-lg md:p-8" id="stats">
				<dl class="grid max-w-screen-xl gap-8 mx-auto text-gray-900 sm:grid-cols-2 xl:grid-cols-3 md:grid-cols-3">
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">${this.user.numberOfMatches}</dt>
						<dd class="whitespace-nowrap">Total match played</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">${this.user.numberOfWin}</dt>
						<dd class="whitespace-nowrap">Total match won</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">${winRate} %</dt>
						<dd class="whitespace-nowrap">Winrate</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">${averageRally}</dt>
						<dd class="whitespace-nowrap">Average rally per round</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold flex flex-row">
							<div>${rank}</div>
							<div class="text-xl">${formatOrdinals(rank)}</div>
						</dt>
						<dd class="whitespace-nowrap">Rank</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">
							<div class="flex flex-row justify-center items-center relative group">
								${leagueImage}
							</div>
						</dt>
						<div class="flex flex-row justify-center items-center">
							<dd class="whitespace-nowrap">
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
	{ name: 'Summit', color: '#CC04A6', icon: 'mountain', threshold: 20 },
	{ name: 'Ruby', color: '#E0115F', icon: 'diamond', threshold: 40 },
	{ name: 'Storm', color: '#04B1C9', icon: 'tornado', threshold: 60 },
	{ name: 'Mist', color: '#C9D6DF', icon: 'cloud', threshold: 80 },
	{ name: 'Bud', color: '#7AC74F', icon: 'sprout', threshold: 100 },
] as const

function getLeagueHtml(usersStats: UserStats[], userRank: number): string {
	let league: League = leagues[leagues.length - 1]
	if (usersStats.length <= leagues.length) league = leagues[userRank - 1]
	else {
		const percentage = (userRank / usersStats.length) * 100
		league =
			leagues.find(({ threshold }) => percentage < threshold) ||
			leagues[leagues.length - 1]
	}
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
