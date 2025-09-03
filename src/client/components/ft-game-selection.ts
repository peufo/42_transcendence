import { $user } from '../utils/store.js'

customElements.define(
	'ft-game-selection',
	class extends HTMLElement {
		connectedCallback() {
			const user = $user.get()
			let activeTournamentButton = ''
			if (user?.tournament)
				activeTournamentButton = /*html*/ `
				<a href="/tournament/play?tournamentId=${user.tournament.id}" class="btn btn-primary col-span-2">
					<ft-icon name="rotate-cw" class="h-5 w-5 mr-1"></ft-icon>
					Return to tournament
				</a>`

			this.innerHTML = /*html*/ `
				<div class="grid grid-cols-2 gap-3">
					<div class="flex flex-col gap-1 p-1 justify-evenly ring-2 ring-indigo-500 rounded-lg">
						<div class="text-center">Local</div>
						<a  href="/local/new" class="btn btn-primary">
							<ft-icon name="swords" class="h-5 w-5 mr-1"></ft-icon>
							Versus
						</a>
					</div>
					<div class="flex flex-col gap-1 p-1 justify-evenly ring-2 ring-indigo-500 rounded-lg">
						<div class="text-center">Remote</div>
						<a href="/remote/new" class="btn btn-primary">
							<ft-icon name="swords" class="h-5 w-5 mr-1"></ft-icon>
							Versus
						</a>
						<a href="/tournament/new" class="btn btn-primary">
							<ft-icon name="trophy" class="h-5 w-5 mr-1"></ft-icon>
							Create tournament
						</a>
					</div>
					${activeTournamentButton}
				</div>
			`
		}
	},
)
