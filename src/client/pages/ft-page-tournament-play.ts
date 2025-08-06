import { type ChannelSocket, openChannel } from '../../lib/socketChannels.js'
import { toast } from '../components/ft-toast.js'
import { getAvatarSrc } from '../utils/avatar.js'
import { type CleanEffect, createEffect } from '../utils/signal.js'
import { $tournament, $user } from '../utils/store.js'

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
						if ($user.get()?.id === newParticipant.user.id) return
						$tournament.update((tournament) => {
							if (!tournament) return tournament
							const isParticipantExist = tournament.participants.find(
								({ user }) => user.id === newParticipant.user.id,
							)
							if (isParticipantExist) return tournament
							toast.success(`${newParticipant.user.name} join the tournament !`)
							return {
								...tournament,
								participants: [...tournament.participants, newParticipant],
							}
						})
					},
					onParticipantQuit(participant) {
						if ($user.get()?.id === participant.user.id) return
						$tournament.update((tournament) => {
							if (!tournament) return tournament
							toast.error(`${participant.user.name} quit the tournament !`)
							return {
								...tournament,
								participants: tournament.participants.filter(
									({ user }) => user.id !== participant.user.id,
								),
							}
						})
					},
				},
			)
		}

		async disconnectedCallback() {
			this.cleanEffect()
			this.tournamentChannel.close()
			const tournamentId = $tournament.get()?.id
			await fetch(`/tournaments/quit`, {
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tournamentId }),
				method: 'post',
			})
		}

		render() {
			const tournament = $tournament.get()
			if (!tournament) return /*html*/ `<span>Tournament not found</span>`
			const user = $user.get()
			if (!user) return ''
			const iParticipate = tournament.participants.find(
				({ user: { id } }) => id === user.id,
			)

			// const action = iParticipate ? 'quit' : 'join'
			// const buttonText = action === 'quit' ? 'Quit' : 'Join'
			// const participantButton = () => {
			// 	if (action === 'join') /*html*/ `
			// 		<form action="/tournaments/join" method="post" class="contents">
			// 			<input type="hidden" name="tournamentId" value="${tournament.id}" />
			// 			<input type="submit" value="${buttonText}" class="btn btn-border cursor-pointer">
			// 		</form>
			// 	`}

			const leaveButton = /*html*/ `
				<a class="btn btn-border cursor-pointer" href="/me">Quit</a>
			`
			const participantAction = /*html*/ `
				<div class="flex flex-row gap-2 p-2 justify-center item-center">
					${leaveButton}
				${
					!iParticipate
						? `
				<form action="/tournaments/join" method="post" class="contents">
					<input type="hidden" name="tournamentId" value="${tournament.id}" />
					<input type="submit" value="Join" class="btn btn-border cursor-pointer">
				</form>`
						: ''
				}
				</div>
			`

			const title = /*html*/ `
			<h1 class="p-2 flex font-bold item-center justify-center">${tournament.createdByUser.name}'s tournament</h1>
			`
			const participantsCount = /*html*/ `
			<div class="p-2 flex item-center justify-center">
				${tournament.participants.length} 
				/ ${tournament.numberOfPlayers} players
			</div>
			`

			const participantList = /*html*/ `
				<div class="flex flex-col item-center justify-center">
					${tournament.participants
						.map((participant) => {
							return /*html*/ `
					<div class="flex p-2 items-center gap-2 border border-gray-200 rounded-xl">
                        <img src="${getAvatarSrc(participant.user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
                        <span>${participant.user.name}</span>
               		</div>`
						})
						.join('')}
				</div>
				`

			return /*html*/ `
			<div class="flex flex-col gap-3 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				${title}
				${participantsCount}
				${participantList}
				${participantAction}
			</div>
			`
		}
	},
)
