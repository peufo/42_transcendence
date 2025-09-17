import { getCurrentStage } from '../../lib/tournament.js'
import type { Match } from '../../lib/type.js'
import { defineComponent } from '../utils/component.js'
import {
	$match,
	$participants,
	$stages,
	$tournament,
	$user,
} from '../utils/store.js'

defineComponent('ft-bracket', () => {
	return {
		postRender(element) {
			const match = $match.get()
			if (match) {
				// TODO: no smooth scroll, or better rendering granulariti
				setTimeout(() => {
					element.querySelector(`#match-${match?.id}`)?.scrollIntoView({
						behavior: 'smooth',
					})
				}, 80)
			}
		},
		render() {
			const tournament = $tournament.get()
			const user = $user.get()
			const participants = $participants.get()

			console.log('RENDER BRACKET')
			const stages = $stages.get()
			if (!user || !tournament) return 'user or tournament not found'

			const iParticipate = participants.find(
				({ user: { id } }) => id === user?.id,
			)

			const quitButton = /*html*/ `
				<form action="/tournaments/quit" method="post" class="contents">
					<input type="hidden" name="tournamentId" value="${tournament.id}" />
					<input type="submit" value="Quit" class="btn btn-border cursor-pointer">
				</form>
			`

			const currentStage = getCurrentStage(stages)
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

			const renderStage = (stage: Match[]) => {
				const matchElements = stage.map(renderMatch)
				let currentStageClasses = ''
				if (stage === currentStage) {
					currentStageClasses = 'ring-1 ring-indigo-500 rounded-lg bg-indigo-50'
				}
				const stageNames = ['Final', 'Semi', 'Quarter', 'Eight']
				return /*html*/ `
                    <div class="flex flex-col gap-4">
                        <h3 class="text-center">
                            ${stageNames.at(stages.length - stages.indexOf(stage) - 1)}
                        </h3>
                        <div class="flex flex-col gap-1 p-1 min-w-56 snap-center justify-evenly grow  ${currentStageClasses}">
                            ${matchElements.join('')}
                        </div>
                    </div>

                `
			}

			const matchIcons: Record<Match['state'], string> = {
				awaiting: /*html*/ `<ft-icon name="clock" class="w-3 h-3 stroke-amber-500"></ft-icon>`,
				ongoing: /*html*/ `<ft-icon name="loader-circle" class="w-3 h-3 stroke-indigo-500"></ft-icon>`,
				finished: /*html*/ `<div></div>`,
			}

			const renderMatch = (match: Match) => {
				let colorP1 = ''
				let colorP2 = ''
				if (match.player1 && user?.id === match.player1.id)
					colorP1 = 'text-indigo-600 font-bold'
				else if (match.player2 && user?.id === match.player2.id)
					colorP2 = 'text-indigo-600 font-bold'
				return /*html*/ `
                    <div id="match-${match.id}" class="bg-white border border-gray-200 rounded-md">
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
			}

			return /*html*/ `
				<aside class="flex flex-col gap-4">
					<div class="overflow-x-scroll rounded-md border border-gray-200 snap-x snap-mandatory">
						${renderStages()}
					</div>
					${iParticipate && tournament.state !== 'finished' ? quitButton : ''}
				</aside>
            `
		},
	}
})
