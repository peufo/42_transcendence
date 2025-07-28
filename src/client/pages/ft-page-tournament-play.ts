import { type ChannelSocket, openChannel } from '../../lib/socketChannels.js'
import { toast } from '../components/ft-toast.js'
import { type CleanEffect, createEffect } from '../utils/signal.js'
import { $tournament, $user } from '../utils/store.js'

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
				new URLSearchParams(document.location.search).get('id') || ''

			this.tournamentChanel = openChannel(
				'tournaments',
				{ tournamentId },
				{
					onDeleted() {
						toast.error('Tournament canceled by owner')
					},
					onParticipantJoin({ participant }) {
						$tournament.update((tournament) => {
							if (!tournament) return tournament
							const isParticipantExist = tournament.participants.find(
								({ user }) => user.id === participant.id,
							)
							if (isParticipantExist) return tournament
							return {
								...tournament,
								participants: [
									...tournament.participants,
									{ user: participant },
								],
							}
						})
					},
					onParticipantQuit({ participant }) {
						$tournament.update((tournament) => {
							if (!tournament) return tournament
							return {
								...tournament,
								participants: tournament.participants.filter(
									({ user }) => user.id !== participant.id,
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
