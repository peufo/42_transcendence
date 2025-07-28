import { type ChannelSocket, openChannel } from '../../lib/socketChannels.js'
import { toast } from '../components/ft-toast.js'
import { type CleanEffect, createEffect } from '../utils/signal.js'
import { $tournament } from '../utils/store.js'

customElements.define(
	'ft-page-tournament-play',
	class extends HTMLElement {
		private cleanEffect: CleanEffect
		private tournamentChanel: ChannelSocket<'tournaments'> | null = null

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				const tournament = $tournament.get()
				this.innerHTML = /*html*/ `
					<pre>${JSON.stringify(tournament, null, 4)}</pre>	
				`
			})

			this.tournamentChanel = openChannel('tournaments', {
				onCanceled() {
					toast.error('Tournament canceled by owner')
				},
				onNewParticipant({ participant }) {
					$tournament.update((tournament) => {
						if (!tournament) return tournament
						return {
							...tournament,
							participants: [...tournament.participants, { user: participant }],
						}
					})
				},
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
			this.tournamentChanel?.close()
		}
	},
)
