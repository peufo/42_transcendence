import { getCurrentStage } from '../../lib/tournament.js'
import type { Match } from '../../lib/type.js'
import { type CleanEffect, createEffect } from '../utils/signal.js'
import { $participants, $stages, $tournament, $user } from '../utils/store.js'

customElements.define(
	'ft-bracket',
	class extends HTMLElement {
		private user = $user.get()
		private tournament = $tournament.get()
		private participants = $participants.get()
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
			const stages = $stages.get()
			if (!this.user || !this.tournament) return 'user or tournament not found'

			const iParticipate = this.participants.find(
				({ user: { id } }) => id === this.user?.id,
			)

			const quitButton = /*html*/ `
				<form action="/tournaments/quit" method="post" class="contents">
					<input type="hidden" name="tournamentId" value="${this.tournament.id}" />
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
				if (match.player1 && this.user?.id === match.player1.id)
					colorP1 = 'text-indigo-600 font-bold'
				else if (match.player2 && this.user?.id === match.player2.id)
					colorP2 = 'text-indigo-600 font-bold'
				return /*html*/ `
                    <div class="bg-white border border-gray-200 rounded-md">
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
					${iParticipate && this.tournament.state !== 'finished' ? quitButton : ''}
				</aside>
            `
		}
	},
)
