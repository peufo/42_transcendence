import { type ChannelSocket, openChannel } from '../../lib/socketChannels.js'
import { toast } from '../components/ft-toast.js'
import { type CleanEffect, createEffect } from '../utils/signal.js'
import { $tournament, $url, $user } from '../utils/store.js'

customElements.define(
	'ft-page-tournament-play',
	class extends HTMLElement {
		private cleanEffect: CleanEffect
		private tournamentChanel: ChannelSocket<'tournaments'>

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})

			const tournamentId =
				new URLSearchParams(document.location.search).get('tournamentId') || ''

			this.tournamentChanel = openChannel(
				'tournaments',
				{ tournamentId },
				{
					onDeleted() {
						toast.error('Tournament deleted by owner')
						$url.set(new URL('/me', document.baseURI))
					},
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

		disconnectedCallback() {
			this.cleanEffect()
			this.tournamentChanel.close()
		}

		render() {
			const tournament = $tournament.get()
			if (!tournament) return /*html*/ `<span>Tournament not found</span>`
			const user = $user.get()
			if (!user) return ''
			const iParticipate = tournament.participants.find(
				({ user: { id } }) => id === user.id,
			)
			const imOwner = tournament.createdBy === user.id
			const action = iParticipate ? (imOwner ? 'delete' : 'quit') : 'join'

			const participationForm = /*html*/ `
				<form action="/tournaments/${action}" method="post" class="contents">
					<input type="hidden" name="tournamentId" value="${tournament.id}" />
					<input type="submit" value="${action}" class="btn btn-border cursor-pointer">
				</form>
			`

			return /*html*/ `
				${participationForm}
				<pre>${JSON.stringify(tournament, null, 4)}</pre>	
			`
		}
	},
)
