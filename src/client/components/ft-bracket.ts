import type { Match } from '../../lib/type.js'
import { defineComponent } from '../utils/component.js'
import { createEffect } from '../utils/signal.js'
import {
	$matchId,
	$participants,
	$tournament,
	$user,
	matchMap,
} from '../utils/store.js'

defineComponent('ft-bracket-match', () => {
	return {
		render(element) {
			const user = $user.get()
			const currentMatchId = $matchId.get()
			const matchId = +(element.getAttribute('matchId') || -1)
			if (matchId === -1) {
				throw new Error('matchId attribute is required')
			}
			const match = matchMap.get(matchId)?.get()
			if (!match) {
				throw new Error('matchId should find match in matchMap')
			}
			const matchIcons: Record<Match['state'], string> = {
				awaiting: /*html*/ `<ft-icon name="clock" class="w-3 h-3 stroke-amber-500"></ft-icon>`,
				ongoing: /*html*/ `<ft-icon name="loader-circle" class="w-3 h-3 stroke-indigo-500"></ft-icon>`,
				finished: /*html*/ `<div></div>`,
			}

			let colorP1 = ''
			let colorP2 = ''
			if (match.player1 && user?.id === match.player1.id)
				colorP1 = 'text-indigo-600 font-bold'
			else if (match.player2 && user?.id === match.player2.id)
				colorP2 = 'text-indigo-600 font-bold'
			const highlightClasses =
				match.id === currentMatchId
					? 'ring-1 ring-indigo-500 rounded-lg bg-indigo-50'
					: ''

			return /*html*/ `
				<div
					id="match-${match.id}"
					class="bg-white border border-gray-200 rounded-md ${highlightClasses}"
					
				>
					<div class="grid grid-cols-7 p-1 items-center justify-items-center">
						<div class="text-xs break-word text-center col-span-3 ${colorP1}">
							${match.player1 ? match.player1.name : '?'}
						</div>
						<ft-icon name="zap" class="h-3 scale-x-75 rotate-12"></ft-icon>
						<div class="text-xs break-word text-center col-span-3 ${colorP2}">
							${match.player2 ? match.player2.name : '?'}
						</div>
					</div>
					<div class="grid grid-cols-7 p-1 items-center justify-items-center">
						<span class="text-xs col-span-3">${match.player1Score}</span>
						${matchIcons[match.state]}
						<span class="text-xs col-span-3">${match.player2Score}</span>
					</div>
				</div>
			`
		},
	}
})

defineComponent('ft-bracket', () => {
	return {
		render() {
			const tournament = $tournament.get()
			const user = $user.get()
			const participants = $participants.get()

			const stages = tournament?.stages
			if (!user || !tournament || !stages)
				return 'user or tournament or stages not found'

			const iParticipate = participants.find(
				({ user: { id } }) => id === user?.id,
			)

			const quitButton = /*html*/ `
				<form action="/tournaments/quit" method="post" class="contents">
					<input type="hidden" name="tournamentId" value="${tournament.id}" />
					<input type="submit" value="Quit" class="btn btn-border">
				</form>
			`

			const renderStages = () => {
				if (!stages.length) return 'No stages'
				const stagesElements = stages.map(renderStage)
				return /*html*/ `
                    <div class="flex gap-4 p-4">
                        <div class="flex flex-col gap-4 min-w-26"></div>
                        ${stagesElements.join('')}
                        <div class="flex flex-col gap-4 min-w-26"></div>
                    </div>
                `
			}

			const renderStage = (stage: number[]) => {
				const matchElements = stage.map(
					(matchId) => /*html*/ `
						<ft-bracket-match matchId=${matchId}></ft-bracket-match>
					`,
				)
				const stageNames = ['Final', 'Semi', 'Quarter', 'Eight']
				return /*html*/ `
                    <div class="flex flex-col gap-4">
                        <h3 class="text-center">
                            ${stageNames.at(stages.length - stages.indexOf(stage) - 1)}
                        </h3>
                        <div class="flex flex-col gap-1 p-1 min-w-56 snap-center justify-evenly grow">
                            ${matchElements.join('')}
                        </div>
                    </div>

                `
			}

			return /*html*/ `
				<div class="flex flex-col gap-4">
					<div class="overflow-x-scroll card snap-x snap-mandatory">
						${renderStages()}
					</div>
					${iParticipate && tournament.state !== 'finished' ? quitButton : ''}
				</div>
            `
		},
		onLoad(element) {
			return createEffect(() => {
				const matchId = $matchId.get()
				element.querySelector(`#match-${matchId}`)?.scrollIntoView({
					behavior: 'smooth',
				})
			})
		},
	}
})
