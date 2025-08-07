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
							toast.success(
								`${newParticipant.user.name} joined the tournament !`,
							)
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
							toast.error(`${participant.user.name} quitted the tournament !`)
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
			// const tournamentId = $tournament.get()?.id
			// await fetch(`/tournaments/quit`, {
			// 	headers: { 'Content-Type': 'application/json' },
			// 	body: JSON.stringify({ tournamentId }),
			// 	method: 'post',
			// })
		}

		render() {
			const tournament = $tournament.get()
			if (!tournament) return /*html*/ `<span>Tournament not found</span>`
			const user = $user.get()
			if (!user) return ''
			const iParticipate = tournament.participants.find(
				({ user: { id } }) => id === user.id,
			)

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
			const playerColor = () => {
				let html = ''
				if (tournament.participants.length === tournament.numberOfPlayers)
					html = 'text-lime-400 font-bold'
				else html = 'text-gray-400'
				return html
			}
			const participantsCount = /*html*/ `
			<div class="p-2 flex item-center justify-center ${playerColor()}">
				${tournament.participants.length}
				/ ${tournament.numberOfPlayers} players
			</div>
			`

			const participantList = () => {
				let html = '<div class="flex flex-col item-center justify-center">'
				let number = 0
				for (const participant of tournament.participants) {
					html += /*html*/ `
					<div class="flex p-2 items-center gap-5 border border-gray-200 rounded-xl">
						<div class="flex pl-2">${number + 1}</div>
						<div class="flex flex-row gap-2 items-center">
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
						<div class="flex pl-2">${number + 1}</div>
						<div class="flex items-center justify-center animate-bounce">... waiting for user ...</div>
					</div>
					`
					number++
				}
				html += '</div>'
				return html
			}
			// /*html*/
			// ;`
			// 	<div class="flex flex-col item-center justify-center">
			// 		${tournament.participants
			// 			.map((participant) => {
			// 				return /*html*/ `
			// 		<div class="flex p-2 items-center gap-2 border border-gray-200 rounded-xl">
			//             <img src="${getAvatarSrc(participant.user)}" alt="Avatar de l'utilisateur" class="h-8 w-8 rounded">
			//             <span>${participant.user.name}</span>
			//    		</div>`
			// 			})
			// 			.join('')}
			// 	</div>
			// 	`

			return /*html*/ `
			<div class="flex flex-col gap-3 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				${title}
				${participantsCount}
				${participantList()}
				${participantAction}
			</div>
			`
		}
	},
)
