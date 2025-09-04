import { getAwaitingMatchFromStages } from '../../lib/tournament.js'
import type { ChannelSocket } from '../../lib/useSocketChannels.js'
import { toast } from '../components/ft-toast.js'
import { socketChannel } from '../socketChannel.js'
import { getAvatarSrc } from '../utils/avatar.js'
import { setMatch } from '../utils/match.js'
import { type CleanEffect, createEffect } from '../utils/signal.js'
import { $participants, $stages, $tournament, $user } from '../utils/store.js'

customElements.define(
	'ft-page-tournament-play',
	class extends HTMLElement {
		private user = $user.get()
		private cleanEffect: CleanEffect
		private tournamentChannel: ChannelSocket<'tournaments'>

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})

			const tournamentId =
				new URLSearchParams(document.location.search).get('tournamentId') || ''

			this.tournamentChannel = socketChannel(
				'tournaments',
				{ tournamentId },
				{
					onParticipantJoin: (newParticipant) => {
						console.log('onParticipantJoin')
						toast.success(`${newParticipant.user.name} joined the tournament !`)
						$participants.update((participants) => {
							const isParticipantExist = participants.find(
								({ user }) => user.id === newParticipant.user.id,
							)
							if (isParticipantExist) return participants
							return [...participants, newParticipant]
						})
					},
					onParticipantQuit: (participant) => {
						console.log('onParticipantQuit')
						toast.error(`${participant.user.name} left the tournament !`)
						$participants.update((participants) => {
							return participants.filter(
								({ user }) => user.id !== participant.user.id,
							)
						})
					},
					onStart: ({ stages }) => {
						console.log('onStart')
						toast.success('Tournament starting')
						$stages.set(stages)
						const userId = this.user?.id
						if (userId) {
							const myMatch = getAwaitingMatchFromStages(userId, stages)
							setMatch(myMatch)
						}
						$tournament.update((t) => {
							if (!t) return undefined
							return { ...t, state: 'ongoing' }
						})
					},
					onMatchChange: ({ match }) => {
						console.log('onMatchChange')
						$stages.update((stages) => {
							const m = stages.flat().find((m) => m.id === match.id)
							if (!m) return stages
							Object.assign(m, match)
							if (
								m.player1Id === this.user?.id ||
								m.player2Id === this.user?.id
							) {
								setMatch(m)
							}
							return stages
						})
					},
					onEnd: () => {
						console.log('onEnd')
						toast.success('Tournament terminated')
						$tournament.update((t) => (!t ? t : { ...t, state: 'finished' }))
					},
				},
			)
		}

		disconnectedCallback() {
			this.cleanEffect()
			this.tournamentChannel.close()
		}

		render() {
			console.log('RENDER TOURNAMENT PAGE')
			const tournament = $tournament.get()
			if (!tournament) return /*html*/ `<span>Tournament not found</span>`
			if (tournament.state === 'finished')
				return `<span>${tournament.createdByUser.name}'s tournament is over</span>`
			return `<ft-tournament-${tournament.state}></ft-tournament-${tournament.state}>`
		}
	},
)

customElements.define(
	'ft-tournament-open',
	class extends HTMLElement {
		private user = $user.get()
		private tournament = $tournament.get()
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				console.log('RENDER TOURNAMENT OPEN')
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
		}

		render(): string {
			if (!this.tournament) return /*html*/ `<span>Tournament not found</span>`
			if (!this.user) return ''
			const participants = $participants.get()

			const iParticipate = participants.find(
				({ user: { id } }) => id === this.user?.id,
			)
			const action = iParticipate ? 'quit' : 'join'
			const buttonText = action === 'quit' ? 'Quit' : 'Join'

			const participationForm = /*html*/ `
				<form action="/tournaments/${action}" method="post" class="contents">
					<input type="hidden" name="tournamentId" value="${this.tournament.id}" />
					<input type="submit" value="${buttonText}" class="btn btn-border cursor-pointer">
				</form>
			`

			const title = /*html*/ `
			<h1 class="p-2 flex font-bold item-center justify-center">${this.tournament.createdByUser.name}'s tournament</h1>
			`

			const participantsCountColor =
				participants.length === this.tournament.numberOfPlayers
					? 'text-lime-400 font-bold a'
					: 'text-gray-400'

			const participantsCount = /*html*/ `
			<div class="p-2 flex item-center justify-center ${participantsCountColor}">
				${participants.length}
				/ ${this.tournament.numberOfPlayers} players
			</div>
			`

			const participantList = () => {
				let html = /*html*/ `<div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">`
				let number = 0
				for (const participant of participants) {
					html += /*html*/ `
						<div class="flex p-2 items-center gap-2 border border-gray-200 rounded-xl">
							<div class="w-1/10 pl-2 font-bold">${number + 1}</div>
							<div class="w-9/10 flex flex-row gap-2 items-center">
								<img src="${getAvatarSrc(participant.user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
								<div>${participant.user.name}</div>
							</div>
						</div>
					`
					number++
				}
				const numberOfPlayers = this.tournament?.numberOfPlayers || 0
				while (number < numberOfPlayers) {
					html += /*html*/ `
						<div class="flex p-2 justify-center items-center gap-2 border border-gray-200 rounded-xl">
							<div class="w-9/10 flex items-center justify-center animate-pulse text-indigo-500"
								style="animation-delay: ${number * 80}ms;">
								... Waiting for players ...
							</div>
						</div>
					`
					number++
				}
				html += '</div>'
				return html
			}
			let startButton = ``
			if (this.user.id === participants[0].user.id)
				startButton = /*html*/ `
				<form action="/tournaments/start" method="post" class="contents">
					<input type="hidden" name="tournamentId" value="${this.tournament.id}" />
					<input type="submit" class="btn btn-border cursor-pointer" value="Start">
				</form>
				`

			return /*html*/ `
				<div class="flex flex-col gap-3 mt-10 sm:mx-auto sm:max-w-lg mx-4">
					${title}
					${participantsCount}
					${participantList()}
					${participationForm}
					${startButton}
				</div>
			`
		}
	},
)

customElements.define(
	'ft-tournament-ongoing',
	class extends HTMLElement {
		connectedCallback() {
			console.log('RENDER TOURNAMENT ONGOING')
			this.innerHTML = this.render()
			// window.addEventListener('beforeunload', () => {
			// 	(e: BeforeUnloadEvent) => {
			// 		e.preventDefault()
			// 	}
			// })
		}

		// disconnectedCallback(){
		// 	window.removeEventListener('beforeunload', () => {
		// 		(e: BeforeUnloadEvent) => {
		// 			e.preventDefault()
		// 		}
		// 	})
		// }

		render(): string {
			// window.onbeforeunload = (e) => {
			// 	if (e){
			// 		e.preventDefault()
			// 		e.returnValue = '';
			// 	}
			// };
			// TODO: set matchID
			// const stages=$stages.get()
			// const myMatch: MatchBasic | undefined =
			// getMyAwaitingMatchFromStages(stages)
			// setMatch(myMatch)

			return /*html*/ `
				<div class="grid grid-cols-4 gap-4 p-4 min-w-[1360px]">
					<ft-bracket></ft-bracket>
					<div class="col-span-3">
							<ft-pong-remote></ft-pong-remote>
						</div>
					</div>
				</div>
			`
		}
	},
)
