import { type ChannelSocket, openChannel } from '../../lib/socketChannels.js'
import { toast } from '../components/ft-toast.js'
import { getAvatarSrc } from '../utils/avatar.js'
import { getMyMatch, setMatchId } from '../utils/match.js'
import { type CleanEffect, createEffect } from '../utils/signal.js'
import { $participants, $stages, $tournament, $user } from '../utils/store.js'

customElements.define(
	'ft-page-tournament-play',
	class extends HTMLElement {
		private cleanEffect: CleanEffect
		private tournamentChannel: ChannelSocket<'tournaments'>

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})

			const tournamentId =
				new URLSearchParams(document.location.search).get('tournamentId') || ''

			this.tournamentChannel = openChannel(
				'tournaments',
				{ tournamentId },
				{
					onParticipantJoin(newParticipant) {
						toast.success(`${newParticipant.user.name} joined the tournament !`)
						$participants.update((participants) => {
							const isParticipantExist = participants.find(
								({ user }) => user.id === newParticipant.user.id,
							)
							if (isParticipantExist) return participants
							return [...participants, newParticipant]
						})
					},
					onParticipantQuit(participant) {
						toast.error(`${participant.user.name} left the tournament !`)
						$participants.update((participants) => {
							return participants.filter(
								({ user }) => user.id !== participant.user.id,
							)
						})
					},
					onStart({ stages }) {
						toast.success('Tournament starting')
						$stages.set(stages)
						$tournament.update((t) => {
							if (!t) return undefined
							return { ...t, state: 'ongoing' }
						})

						const myMatch = getMyMatch(stages)
						if (!myMatch) return
						setMatchId(myMatch.id)
					},
					onMatchChange({ match }) {
						$stages.update((stages) => {
							const user = $user.get()
							const m = stages.flat().find((m) => m.id === match.id)
							if (!m) return stages
							Object.assign(m, match)
							if (
								match.player1Id === user?.id ||
								match.player2Id === user?.id
							) {
								// TODO: ensure close current channel before ?
								// setMatchId(m.id)
							}
							return stages
						})
					},
					onEnd() {
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
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
		}

		render(): string {
			const tournament = $tournament.get()
			const participants = $participants.get()
			if (!tournament) return /*html*/ `<span>Tournament not found</span>`
			const user = $user.get()
			if (!user) return ''

			const iParticipate = participants.find(
				({ user: { id } }) => id === user.id,
			)
			const action = iParticipate ? 'quit' : 'join'
			const buttonText = action === 'quit' ? 'Quit' : 'Join'

			const participationForm = /*html*/ `
				<form action="/tournaments/${action}" method="post" class="contents">
					<input type="hidden" name="tournamentId" value="${tournament.id}" />
					<input type="submit" value="${buttonText}" class="btn btn-border cursor-pointer">
				</form>
			`

			const title = /*html*/ `
			<h1 class="p-2 flex font-bold item-center justify-center">${tournament.createdByUser.name}'s tournament</h1>
			`

			const participantsCountColor =
				participants.length === tournament.numberOfPlayers
					? 'text-lime-400 font-bold a'
					: 'text-gray-400'

			const participantsCount = /*html*/ `
			<div class="p-2 flex item-center justify-center ${participantsCountColor}">
				${participants.length}
				/ ${tournament.numberOfPlayers} players
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
				while (number < tournament.numberOfPlayers) {
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

			return /*html*/ `
				<div class="flex flex-col gap-3 mt-10 sm:mx-auto sm:max-w-lg mx-4">
					${title}
					${participantsCount}
					${participantList()}
					${participationForm}
				</div>
			`
		}
	},
)

customElements.define(
	'ft-tournament-ongoing',
	class extends HTMLElement {
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
		}

		render(): string {
			const tournament = $tournament.get()
			if (!tournament) return /*html*/ `<span>Tournament not found</span>`
			const user = $user.get()
			if (!user) return 'User not authentified'

			return /*html*/ `
				<div class="grid grid-cols-4 gap-4 p-4 min-w-[1360px]">
					<ft-bracket></ft-bracket>
					<div class="col-span-3">
						<ft-pong-remote></ft-pong-remote>
					</div>
				</div>
			`
		}
	},
)
