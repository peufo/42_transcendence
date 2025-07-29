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
					<div class="grid grid-cols-1 lg:grid-cols-2 grid-flow-row gap gap-4 p-10">
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
							if (userIsPlayer1) return 'text-green-400 font-bold'
							return 'text-red-400 font-bold'
						}
						if (userIsPlayer1) return 'text-red-400 font-bold'
						return 'text-green-400 font-bold'
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
									class="mr-1 fill-amber-400 stroke-amber-800 scale-x-75 rotate-12">
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
			let html = `<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Ranking</h2>`
			let rank = 1
			let name_color = ''
			let left_arrow = ''
			let right_arrow = ''
			let user_in_top = false
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
				if (rank >= 6) {
					if (user.id === current_user.id) break
					else {
						rank++
						continue
					}
				}
				if (user.id === current_user.id) {
					name_color = `font-bold`
					left_arrow = '🢚'
					right_arrow = '🢘'
					user_in_top = true
				} else {
					name_color = ''
					left_arrow = ''
					right_arrow = ''
				}

				html += `
				<div class="flex items-center text-center p-2 border border-gray-200 rounded-xl">
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
				html += `
				</div>
					<div class="w-1/6 flex justify-center items-center">
						<img src="${getAvatarSrc(user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
					</div>
					<div class="w-2/6 flex justify-center items-center ${name_color}">${left_arrow} ${user.name} ${right_arrow}</div>
					<div class="w-2/6 flex justify-center items-center">${user.numberOfGoals}</div>
				</div>`
				rank++
			}
			if (!user_in_top) {
				html += `
			<div class="flex items-center justify-center p-2 rounded-xl font-bold">...</div>
			<div class="flex items-center text-center p-2 border border-gray-200 rounded-xl">
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
				const html = `<div class="grid grid-flow-row grid-rows-2 gap-2">
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
			const rank = getUserRank(getAllUsersStats, user)
			const leagueImage = getLeague(getAllUsersStats, rank)
			let filler = 'th'
			switch (rank) {
				case 1:
					filler = 'st'
					break
				case 2:
					filler = 'nd'
					break
				case 3:
					filler = 'rd'
					break
				case 21:
					filler = 'st'
					break
				case 22:
					filler = 'nd'
					break
				case 23:
					filler = 'st'
					break
				default:
					filler = 'th'
					break
			}

			const html = /*html*/ `
			<div class="grid grid-flow-col grid-rows-2 gap-2">
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Total match played</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${user.numberOfMatches}</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Total match won</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${user.numberOfWin}</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Winrate</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${winRate} %</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Average rally per round</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${averageRally}</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2 font-bold">Rank</h2>
				<h2 class="flex flex-row p-2 items-center justify-center text-center gap-2">${rank}${filler}</h2>
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

function getUserRank(usersStats: UserStats[], user: UserBasic): number {
	let rank = 1
	for (const userstat of usersStats) {
		if (userstat.id === user.id) break
		rank++
	}
	return rank
}

function getLeague(usersStats: UserStats[], user_rank: number): string {
	const percentage = (user_rank / usersStats.length) * 100
	console.log(percentage)
	let color = '#000000'
	let league_name = 'Wood'
	switch (true) {
		case percentage < 10:
			color = '#E91E63'
			league_name = 'Mythic'
			break
		case percentage < 20:
			color = '#F4C542'
			league_name = 'Solaris'
			break
		case percentage < 30:
			color = '#00CFFF'
			league_name = 'Aurora'
			break
		case percentage < 40:
			color = '#5D6D7E'
			league_name = 'Storm'
			break
		case percentage < 50:
			color = '#353839'
			league_name = 'Onyx'
			break
		case percentage < 60:
			color = '#9B59B6'
			league_name = 'Amethyst'
			break
		case percentage < 70:
			color = '#E25822'
			league_name = 'Blaze'
			break
		case percentage < 80:
			color = '#2E86AB'
			league_name = 'Ocean'
			break
		case percentage < 90:
			color = '#4A7C59'
			league_name = 'Moss'
			break
		default:
			color = '#8B2E2E'
			league_name = 'Ember'
			break
	}
	const leagueSvg = getLeagueImage(color, league_name)
	return leagueSvg
}

function getLeagueImage(color: string, league_name: string): string {
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

function getLeagueModal(): string {
	let html = ''
	const leagues_names = [
		'Mythic',
		'Solaris',
		'Aurora',
		'Storm',
		'Onyx',
		'Amethyst',
		'Blaze',
		'Ocean',
		'Moss',
		'Ember',
	]
	const leagues_colors = [
		'#E91E63',
		'#F4C542',
		'#00CFFF',
		'#5D6D7E',
		'#353839',
		'#9B59B6',
		'#E25822',
		'#2E86AB',
		'#4A7C59',
		'#8B2E2E',
	]
	const leagues_percentages = [
		'< 10%',
		'< 20%',
		'< 30%',
		'< 40%',
		'< 50%',
		'< 60%',
		'< 70%',
		'< 80%',
		'< 90%',
		'< 100%',
	]
	html += `
	<div class="absolute left-1/2 top-full transform -translate-x-1/2 p-4 border border-gray-400 rounded-2xl bg-white shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-10 flex justify-center items-center">
		<div class="flex flex-row justify-center items-center">
			`
	for (let i = 0; i < leagues_colors.length; i++) {
		html += `
				<div class="flex flex-col p-2 items-center justify-center text-center gap-2 font-bold">
				${getLeagueImage(leagues_colors[i], leagues_names[i])}
				<div class="font-bold" style="color: ${leagues_colors[i]};">${leagues_percentages[i]}</div>
				</div>
				`
		if (i < leagues_colors.length - 1)
			html += `
		<div class="flex flex-col p-2 items-center justify-center text-center gap-2 font-bold">🡸</div>
		`
	}
	html += `
		</div>
	</div>`
	return html
}
