import type { Match, UserBasic, UserStats } from '../../lib/type.js'
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
					<div class="grid grid-cols-2 gap gap-4 p-10">
						<div class="flex flex-col"><ft-stats></ft-winrate></div>
						<div class="flex flex-col"><ft-goal-distribution></ft-goal-distribution></div>
						<div class="flex flex-col"><ft-match-history></ft-match-history></div>
						<div class="flex flex-col"><ft-ranking></ft-ranking></div>
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
				html += `<div class="flex pl-4 p-2 items-center justify-around gap-2">
				No recent matches can be found.
				</div>`
				return html
			} else {
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
			const current_user = $user.get()
			if (!current_user) return ''
			let html = `<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Overall ranking</h2>`
			let rank = 1
			let name_color = ''
			let rank_color = ''
			let left_arrow = ''
			let right_arrow = ''
			const usersRanked = $rankedUsers.get()
			html += `<div class="flex flex-col w-full gap-2">
			 <div class="flex font-semibold text-center">
				<div class="w-1/6 p-2">Rank</div>
				<div class="w-1/6 p-2">Avatar</div>
				<div class="w-2/6 p-2">Name</div>
				<div class="w-2/6 p-2"># Goals</div>
			</div>
			`
			for (const user of usersRanked) {
				switch (rank) {
					case 1:
						rank_color = 'bg-yellow-500 font-bold'
						break
					case 2:
						rank_color = 'bg-zinc-400 font-bold'
						break
					case 3:
						rank_color = 'bg-orange-700 font-bold'
						break
					default:
						rank_color = ''
						break
				}
				if (user.id === current_user.id) {
					name_color = `text-green-400 font-bold`
					left_arrow = '🢚'
					right_arrow = '🢘'
				} else {
					name_color = ''
					left_arrow = ''
					right_arrow = ''
				}

				html += `
				<div class="flex items-center text-center p-2 border border-gray-200 rounded-xl">
					<div class="w-1/6 flex flex-row justify-center items-center">
						<div class="flex flex-row w-5 h-5 items-center justify-center ${rank_color} rounded-xl"> ${rank} </div>
					</div>
					<div class="w-1/6 flex justify-center items-center">
						<img src="${getAvatarSrc(user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
					</div>
					<div class="w-2/6 flex justify-center items-center ${name_color}">${left_arrow} ${user.name} ${right_arrow}</div>
					<div class="w-2/6 flex justify-center items-center"> ${user.numberOfGoals} goals </div>
				</div>`
				rank++
				if (rank === 6) break
			}
			html += `</div`
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
			const getAllUsersStats = $rankedUsers.get()
			if (userMatches.length === 0) {
				const html = `<div class="grid grid-flow-col grid-rows-2 gap-2">
					<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Total match played</h2>
					<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Winrate</h2>
					<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Average rally per round</h2>
					<h2 class="flex col-start-1 col-end-4 row-start-2 row-end-3 flex-row p-2 items-center justify-center text-center gap-2">No enough matches to calculate statistics.</h2>
				</div>`
				return html
			}
			const winRate = (
				(user.numberOfWin / user.numberOfMatches) *
				100
			).toPrecision(3)
			const averageRally = getAverageRally(userMatches).toPrecision(2)
			const rankingPercentage = getRankingPercentage(getAllUsersStats, user)
			const html = `
			<div class="grid grid-flow-col grid-rows-2 gap-2">
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Total match played</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${user.numberOfMatches}</h2>
								<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Total match won</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${user.numberOfWin}</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Winrate</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${winRate} %</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Average rally per round</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${averageRally}</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">League</h2>
				${rankingPercentage}
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
				const html = `
					<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Weaknesses</h2>
					<div class="flex pl-4 p-2 items-center justify-around gap-2">
					No recent matches can be found.
					</div>
				`
				return html
			}
			const goalTakenY = getGoalTakenY(matches, user)
			const distributionPercentage = convertToPercentage(goalTakenY)
			const html = `
			<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Weaknesses</h2>
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

function getAvatarSrc(user: UserBasic): string {
	if (user.avatar) {
		return user.avatar
	}
	return user.avatarPlaceholder
}

function getRankingPercentage(
	usersStats: UserStats[],
	user: UserBasic,
): string {
	let rank = 1
	for (const users of usersStats) {
		if (users.id === user.id) break
		rank++
	}
	const percentage = (rank / usersStats.length) * 100
	let color = '#000000'
	let league_name = 'Wood'
	switch (true) {
		case percentage < 10:
			color = '#FF4500'
			league_name = 'Mythical'
			break
		case percentage < 20:
			color = '#2E2E2E'
			league_name = 'Obsidian'
			break
		case percentage < 30:
			color = '#C72C48'
			league_name = 'Ruby'
			break
		case percentage < 40:
			color = '#0F52BA'
			league_name = 'Sapphire'
			break
		case percentage < 50:
			color = '#3EB489'
			league_name = 'Emerald'
			break
		case percentage < 60:
			color = '#A0E7E5'
			league_name = 'Crystal'
			break
		case percentage < 70:
			color = '#7A8B8B'
			league_name = 'Steel'
			break
		case percentage < 80:
			color = '#43464B'
			league_name = 'Iron'
			break
		case percentage < 90:
			color = '#708090'
			league_name = 'Stone'
			break
		default:
			color = '8B5E3C'
			league_name = 'Wood'
			break
	}
	const leagueSvg = getLeague(color, league_name)
	return leagueSvg
}

function getLeague(color: string, league_name: string): string {
	const leagueSvg = `
	<div class="flex flex-col p-2 items-center justify-center text-center gap-2">
		<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold" style="color:${color};">${league_name}</h2>
		<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
			width="40px" height="40px" viewBox="0 0 72 72" enable-background="new 0 0 72 72" xml:space="preserve">
		<g>
			<path fill="${color}" d="M68.193,19.713L60.171,8.027c-1.539-2.262-4.937-3.967-7.903-3.967H19.721c-2.966,0-6.363,1.708-7.893,3.96L3.784,19.652
				c-1.711,2.52-1.62,6.4,0.207,8.836l28.002,37.329c1.014,1.352,2.476,2.125,4.01,2.125c1.528,0,2.983-0.771,3.99-2.113l28.004-37.33
				C69.842,26.035,69.93,22.262,68.193,19.713z M52.268,8.06c0.088,0,0.181,0.014,0.271,0.02l-0.782,0.715
				c-0.408,0.372-0.436,1.005-0.064,1.412c0.197,0.217,0.469,0.326,0.74,0.326c0.239,0,0.48-0.086,0.674-0.262l1.718-1.569
				c0.867,0.41,1.633,0.975,2.046,1.583l8.023,11.687c0.212,0.311,0.354,0.688,0.441,1.089h-26.24l8.34-7.612
				c0.406-0.371,0.436-1.004,0.063-1.412c-0.371-0.407-1.005-0.438-1.413-0.064l-9.826,8.969c-0.038,0.035-0.056,0.081-0.087,0.119h-1
				c-0.031-0.039-0.049-0.084-0.086-0.118L18.878,8.149c0.289-0.052,0.573-0.089,0.843-0.089H52.268z M15.127,10.282
				c0.344-0.506,0.939-0.979,1.63-1.362L32.248,23.06H20.23c-0.001,0-0.001,0-0.002,0H6.743c-0.038,0-0.07,0.018-0.107,0.021
				c0.083-0.435,0.226-0.842,0.447-1.167L15.127,10.282z M7.19,26.088c-0.217-0.289-0.375-0.647-0.481-1.035
				c0.012,0,0.022,0.007,0.034,0.007h12.781l0.949,2.375c0.155,0.395,0.532,0.635,0.932,0.635c0.121,0,0.244-0.022,0.364-0.069
				c0.513-0.201,0.767-0.781,0.566-1.295l-0.657-1.646h28.471l-14.16,36.531L25.008,33.534c-0.201-0.513-0.782-0.769-1.296-0.566
				c-0.514,0.201-0.767,0.781-0.566,1.295l10.712,27.375L7.19,26.088z M38.093,61.697L52.294,25.06h12.988
				c-0.106,0.386-0.266,0.744-0.485,1.038L38.093,61.697z"/>
			<path fill="${color}" d="M49.329,13.365c0.241,0,0.483-0.087,0.674-0.262l0.696-0.636c0.406-0.373,0.436-1.005,0.063-1.413
				c-0.371-0.406-1.004-0.434-1.412-0.063l-0.695,0.636c-0.407,0.372-0.437,1.005-0.063,1.413
				C48.788,13.256,49.059,13.365,49.329,13.365z"/>
			<path fill="${color}" d="M23.659,30.087l-0.351-0.895c-0.201-0.511-0.78-0.767-1.296-0.564c-0.513,0.201-0.767,0.781-0.566,1.295l0.351,0.895
				c0.156,0.395,0.533,0.635,0.932,0.635c0.121,0,0.245-0.022,0.364-0.069C23.607,31.183,23.861,30.603,23.659,30.087z"/>
		</g>
		</svg>
	</div>`
	return leagueSvg
}
