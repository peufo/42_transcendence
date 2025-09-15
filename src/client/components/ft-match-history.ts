import type { Match, UserWithTournament } from '../../lib/type.js'
import { getAvatarSrc } from '../utils/avatar.js'
import { createEffect } from '../utils/signal.js'
import { $matches, $user } from '../utils/store.js'

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
				const matches = $matches.get()
				const matchesHead = matches
					.sort((prev, curr) => {
						if (!prev.finishedAt || !curr.finishedAt) return 0
						return curr.finishedAt.getTime() - prev.finishedAt.getTime()
					})
					.slice(0, 5)

				this.innerHTML = this.renderContent(matchesHead)
				addModalEvent(matchesHead)
			})
		}
		renderContent(matches: Match[] | null): string {
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
				for (const match of matches) {
					if (
						!match ||
						!match.finishedAt ||
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
					const formater = new Intl.DateTimeFormat('en-US', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: '2-digit',
					})
					html += /*html*/ `
						<div class="grid grid-cols-3 pl-4 p-2 items-center justify-center gap-2 border border-gray-200 rounded-xl cursor-pointer" id ="match-history-${match.id}">
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
						<div class="flex-col p-5 hidden shadow-2xl gap-3 justify-center rounded-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 bg-white border-gray-200 w-max z-[10]" id="modal-match-${match.id}">
							<div class="flex-1 flex flex-row justify-around items-center pb-2">
								<h2 class="flex flex-row justify-center items-center font-bold">Detailed match</h2>
							</div>
							<div class="absolute top-0 end-0 m-2 btn btn-secondary border-2 border-gray-200 cursor-pointer" id="cross-${match.id}">
									<ft-icon name="x" class="h-4 w-4"></ft-icon>
								</div>
							<div class="text-center">${formater.format(match.finishedAt)}</div>
							<div>
							${getWinner(match, this.user)}
							</div>
							<div class="flex flex-row justify-around items-center">
								<div class="flex flex-row justify-center items-center">
									<img class="h-15 w-15" src="${match.player1.avatarPlaceholder}" alt="Player1 avatar">
									<div class="flex-5 p-4">${match.player1.name}</div>
								</div>
								<div class="font-bold">VS</div>
								<div class="flex flex-row justify-center items-center">
									<div class="flex-5 p-4">${match.player2.name}</div>
									<img class="h-15 w-15" src="${match.player2.avatarPlaceholder}" alt="Player2 avatar">
								</div>
							</div>
							${detailedMatch(match, this.user)}
						</div>
					`
				}
			}
			return html
		}
	},
)

function scoringGraph(match: Match, user: UserWithTournament): string {
	const ralliesPerRound = match.rounds.map((r) => r.rallyCount)
	const maxRallies = Math.max(...ralliesPerRound, 1)
	const html = /*html*/ `
	<div class="flex flex-col justify-center items-center h-max-[100px]">
		<div class="grid grid-cols-[2fr_10fr] grid-rows-[6fr_1fr]">
			<div class="h-[100%] pr-2">
				<div class="flex flex-col justify-evenly items-center h-[100%] pr-2">
					<div class="flex flex-col justify-center items-center">
						<div class="bg-indigo-600 h-5 w-5 rounded" ></div>
						<div>Won</div>
					</div>
					<div class="flex flex-col justify-center items-center">
						<div class="bg-red-400 h-5 w-5 rounded"></div>
						<div>Lost</div>
					</div>
				</div>
			</div>
				<div class="flex justify-between items-end">
				 ${ralliesPerRound
						.map((rallies) => {
							const heightPercent = (rallies / maxRallies) * 100
							const color =
								(match.player1Id === user.id &&
									match.rounds[ralliesPerRound.indexOf(rallies)].scorer ===
										'p1') ||
								(match.player2Id === user.id &&
									match.rounds[ralliesPerRound.indexOf(rallies)].scorer ===
										'p2')
									? 'bg-indigo-600'
									: 'bg-red-400'
							return `<div class="${color} w-6 rounded-t" style="height:${heightPercent}%;"></div>`
						})
						.join('')}
			</div>
			<div></div>
			<div  class="flex flex-row justify-between items-center">
				${match.rounds.map((r) => `<div class="text-center">${r.rallyCount}</div>`).join('')}
			</div>
			<div></div>
			<div  class="flex flex-row justify-between items-center">
				${match.rounds.map((_, i) => `<div class="text-center">R${i + 1}</div>`).join('')}
			</div>
		</div>
	</div>
	`
	return html
}

function detailedMatch(match: Match, user: UserWithTournament): string {
	let html = '<div class="flex flex-col justify-center items-center gap-2">'
	let player1Score = 0
	let player2Score = 0
	if (!match.player2 || !match.player1)
		return `No detailed history is available against AI.`
	if (!match.rounds.length) {
		html += /*html*/ `
				<div class="text-center">No match data.</div>
			</div>
			`
		return html
	}
	html += /*html*/ `
		<div class="flex flex-row h-[100%] w-[100%] justify-center items-center gap-2">
			<div class="flex-1 h-[1px] bg-black"></div>
			<div class="flex-1 text-center whitespace-nowrap">Rounds history</div>
			<div class="flex-1 h-[1px] bg-black"></div>
		</div>
	`
	if (match.player1Score === -1 || match.player2Score === -1) {
		html += /*html*/ `
				<div class="text-center">${match.player1Score === -1 ? match.player1.name : match.player2.name} forfeited.</div>
			`
	} else {
		html += /*html*/ `
				<div class="grid grid-cols-2 gap-x-10">
					<div class="text-center">Scorer</div>
					<div class="text-center">Score</div>
			`
		for (const round of match.rounds) {
			if (match.player1.name === user.name) {
				if (round.scorer === 'p1') {
					player1Score++
					html += /*html*/ `
						<div class="text-indigo-600 text-center">
							You
						</div>
						<div  class="text-indigo-600 text-center">
							${player1Score} - ${player2Score}
						</div>
						`
				} else {
					player2Score++
					html += /*html*/ `
						<div class= "text-red-400 text-center">
							${match.player2.name}
						</div>
						<div class= "text-red-400 text-center">
							${player1Score} - ${player2Score}
						</div>
						`
				}
			} else {
				if (round.scorer === 'p1') {
					player1Score++
					html += /*html*/ `
						<div class="text-red-400 text-center">
							${match.player1.name}
						</div>
						<div class="text-red-400 text-center">
							${player1Score} - ${player2Score}
						</div>
						`
				} else {
					player2Score++
					html += /*html*/ `
						<div class="text-indigo-600 text-center">
							You
						</div>
						<div class="text-indigo-600 text-center">
							${player1Score} - ${player2Score}
						</div>
						`
				}
			}
		}
		html += /*html*/ `
				</div>
			`
	}
	html += `</div>`
	html += /*html*/ `
		<div class="flex flex-row h-[100%] w-[100%] justify-center items-center gap-2">
			<div class="flex-1 h-[1px] bg-black"></div>
			<div class="flex-1 text-center whitespace-nowrap" >Rally per round</div>
			<div class="flex-1 h-[1px] bg-black"></div>
		</div>
	`
	html += scoringGraph(match, user)
	return html
}

function addModalEvent(matchesHead: Match[]) {
	for (const match of matchesHead) {
		const matchHistory = document.querySelector(`#match-history-${match.id}`)
		if (!matchHistory) continue
		matchHistory.addEventListener('click', () => {
			const matchModal = document.querySelector(`#modal-match-${match.id}`)
			if (!matchModal) return
			matchModal.classList.remove('hidden')
			matchModal.classList.add('flex')
			for (const div of matchesHead) {
				const otherdiv = document.querySelector(`#modal-match-${div.id}`)
				if (!otherdiv) continue
				if (div !== match) otherdiv.classList.add('hidden')
			}
		})
		const cross = document.querySelector(`#cross-${match.id}`)
		if (!cross) return
		cross.addEventListener('click', () => {
			const matchModal = document.querySelector(`#modal-match-${match.id}`)
			if (!matchModal) return
			matchModal.classList.add('hidden')
		})
	}
}

function getWinner(match: Match, user: UserWithTournament) {
	if (!match.finishedAt || !match.player1 || !match.player2)
		return /*html*/ `
			<div class="text-indigo-600 flex flex-row justify-center items-center">Match not yet finished</div>
		`
	if (
		(user.name === match.player1.name && match.player2Score === -1) ||
		(user.name === match.player2.name && match.player1Score === -1)
	)
		return /*html*/ `
			<div class="text-indigo-600 flex flex-row justify-center items-center font-bold text-2xl">Victory by forfeit.</div>
		`
	else if (
		(user.name === match.player2.name && match.player2Score === -1) ||
		(user.name === match.player1.name && match.player1Score === -1)
	)
		return /*html*/ `
			<div class="text-red-400 flex flex-row justify-center items-center font-bold text-2xl">Defeat by forfeit</div>
		`
	else if (
		(user.name === match.player1.name &&
			match.player1Score > match.player2Score) ||
		(user.name === match.player2.name &&
			match.player2Score > match.player1Score)
	)
		return /*html*/ `
			<div class="text-indigo-600 flex flex-row justify-center items-center font-bold text-2xl">Victory!</div>
		`
	else
		return /*html*/ `
			<div class="text-red-400 flex flex-row justify-center items-center font-bold text-2xl">Defeat</div>
		`
}
