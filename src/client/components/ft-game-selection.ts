import { defineComponent } from '../utils/component.js'
import { $user } from '../utils/store.js'

defineComponent('ft-game-selection', () => {
	return {
		render() {
			const user = $user.get(false)
			let tournamentButton = /*html*/ `
				<a href="/tournament/new" class="btn btn-primary">
					<ft-icon name="trophy" class="h-5 w-5 mr-1"></ft-icon>
					Online Tournament
				</a>
				`
			if (user?.tournament)
				tournamentButton = /*html*/ `
				<a href="/tournament/play?tournamentId=${user.tournament.id}" class="btn btn-primary">
					<ft-icon name="rotate-cw" class="h-5 w-5 mr-1"></ft-icon>
					Return to tournament
				</a>`

			return /*html*/ `
				<div class="p-4 flex flex-col gap-4 shadow-lg rounded-xl border border-indigo-600/25 bg-white/25">   
					<a href="/local/new" class="btn btn-primary">
						<ft-icon name="swords" class="h-5 w-5 mr-1"></ft-icon>
						Local Versus
					</a>
					${tournamentButton}
				</div>
			`
		},
	}
})
