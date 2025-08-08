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
						$tournament.update((tournament) => {
							if (!tournament) return tournament
							toast.error(`${participant.user.name} left the tournament !`)
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

		disconnectedCallback() {
			this.cleanEffect()
			this.tournamentChannel.close()
		}

		render() {
			const tournament = $tournament.get()
			if (!tournament) return /*html*/ `<span>Tournament not found</span>`
			const user = $user.get()
			if (!user) return ''

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
			if (!tournament) return /*html*/ `<span>Tournament not found</span>`
			const user = $user.get()
			if (!user) return ''

			const iParticipate = tournament.participants.find(
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
				tournament.participants.length === tournament.numberOfPlayers
					? 'text-lime-400 font-bold animate-pulse'
					: 'text-gray-400'

			const participantsCount = /*html*/ `
			<div class="p-2 flex item-center justify-center ${participantsCountColor}">
				${tournament.participants.length}
				/ ${tournament.numberOfPlayers} players
			</div>
			`

			const participantList = () => {
				let html = /*html*/ `<div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">`
				let number = 0
				for (const participant of tournament.participants) {
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
			if (!user) return ''

			const quitButton = /*html*/ `
			<form action="/tournaments/quit" method="post" class="contents">
				<input type="hidden" name="tournamentId" value="${tournament.id}" />
				<input type="submit" value="Quit" class="btn btn-border cursor-pointer">
			</form>
			`

			// const tournamentBrackets: string = () => {
			// for (let i = 0; i < ; i++) {
			// 	const element = array[i];

			// }
			// }

			// 	`<div class="flex">
			//       <div class="w-72 m-8 text-center text-xl">Quarterfinals Round</div>
			//       <div class="w-72 m-8 text-center text-xl">Semifinals Round</div>
			//       <div class="w-72 m-8 text-center text-xl">Final Round</div>
			//   </div>
			//   <div class="flex items-center">
			//     <div class="flex-col m-4">
			//       <div class="bg-gray-900 w-72 h-20 m-4"></div>
			//       <div class="bg-gray-900 w-72 h-20 m-4"></div>
			//       <div class="bg-gray-900 w-72 h-20 m-4"></div>
			//       <div class="bg-gray-900 w-72 h-20 m-4"></div>
			//     </div>
			//     <div class="flex-col m-4">
			//       <div class="bg-gray-900 w-72 h-20 m-4"></div>
			//       <div class="p-10"></div>
			//       <div class="bg-gray-900 w-72 h-20 m-4"></div>
			//     </div>
			//     <div class="flex-col m-4">
			//       <div class="bg-gray-900 w-72 h-20 m-4"></div>
			//     </div>
			//   </div>
			// `

			return /*html*/ `
			<h1 class="p-2 flex font-bold item-center justify-center">${tournament.createdByUser.name}'s tournament</h1>
			${quitButton}
			`
		}
	},
)
