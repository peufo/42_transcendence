import { type ChannelSocket, openChannel } from '../../lib/socketChannels.js'
import { getCurrentStage } from '../../lib/tournament.js'
import type { Match } from '../../lib/type.js'
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
					onStart({ stages }) {
						$tournament.update((t) => {
							if (!t) return undefined
							return { ...t, state: 'ongoing', stages }
						})
						toast.success('Tournament starting')
						// TODO: $url.set(matchId=${match.id})
					},
					onMatchChange({ match }) {
						$tournament.update((t) => {
							const user = $user.get()
							// for (const stage of t.stages) {
							// 	for (const m of stage) {
							// 		if (m.id !== match.id) continue
							// 		Object.assign(m, match)
							// 	}
							// }
							const m = t?.stages.flat().find((m) => m.id === match.id)
							if (!t || !m) return t
							Object.assign(m, match)

							if (
								match.player1Id === user?.id ||
								match.player2Id === user?.id
							) {
								// TODO: $url.set(matchId=${match.id})
								// TODO: ensure close current channel before ?
								// openChannel(
								// 	'matches',
								// 	{ matchId: match.id.toString() },
								// 	{
								// 		onEngineEvent(data) {},
								// 		onSurrender(data) {},
								// 	},
								// )
							}

							return { ...t, state: 'ongoing' }
						})

						// update the good match

						// if i'm a player, openChannel('matches)
					},
					onEnd() {
						$tournament.update((t) => (!t ? t : { ...t, state: 'finished' }))
						toast.success('Tournament terminated')
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
					? 'text-lime-400 font-bold a'
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

			const iParticipate = tournament.participants.find(
				({ user: { id } }) => id === user.id,
			)
			const quitButton = /*html*/ `
			<form action="/tournaments/quit" method="post" class="contents">
				<input type="hidden" name="tournamentId" value="${tournament.id}" />
				<input type="submit" value="Quit" class="btn btn-border cursor-pointer">
			</form>
			`

			const currentStage = getCurrentStage(tournament.stages)

			const renderStages = () => {
				if (!tournament.stages) return 'No stages'
				const stages = tournament.stages.map(renderStage)
				return /*html*/ `
					<div class="flex gap-4 p-4">
						<div class="flex flex-col gap-4 min-w-26"></div>
						${stages.join('')}
						<div class="flex flex-col gap-4 min-w-26"></div>
					</div>
				`
			}

			const renderStage = (stage: Match[]) => {
				const vsContainers = stage.map(renderMatch)
				let currentStageClasses = ''
				if (stage === currentStage) {
					currentStageClasses = 'ring-1 ring-indigo-500 rounded-lg bg-indigo-50'
				}
				const stageNames = ['Final', 'Semi', 'Quarter', 'Eight']
				return /*html*/ `
					<div class="flex flex-col gap-4">
						<h3 class="text-center">
							${stageNames.at(tournament.stages.length - tournament.stages.indexOf(stage) - 1)}
						</h3>
						<div class="flex flex-col gap-1 p-1 min-w-56 snap-center justify-evenly grow  ${currentStageClasses}">
							${vsContainers.join('')}
						</div>
					</div>
					
				`
			}

			const matchIcons: Record<Match['state'], string> = {
				awaiting: /*html*/ `<ft-icon name="clock" class="w-3 h-3 stroke-amber-500"></ft-icon>`,
				ongoing: /*html*/ `<ft-icon name="loader-circle" class="w-3 h-3 stroke-indigo-500"></ft-icon>`,
				finished: '',
			}

			const renderMatch = (match: Match) => {
				let colorP1 = ''
				let colorP2 = ''
				if (match.player1 && user.id === match.player1.id)
					colorP1 = 'text-indigo-600 font-bold'
				else if (match.player2 && user.id === match.player2.id)
					colorP2 = 'text-indigo-600 font-bold'
				return /*html*/ `
					<div class="bg-white border border-gray-200 rounded-md">
						<div class="grid grid-cols-7 p-1 items-center justify-items-center">
							<div class="text-xs break-all text-center col-span-3 ${colorP1}">
								${match.player1 ? match.player1.name : '?'}
							</div>
							<ft-icon name="zap" class="h-3 scale-x-75 rotate-12"></ft-icon>
							<div class="text-xs break-all text-center col-span-3 ${colorP2}">
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
				<div class="grid grid-cols-4 gap-4 p-4">
					<aside class="flex flex-col gap-4">
						<h2 class="text-lg font-semi px-2">${tournament.createdByUser.name}'s tournament</h2>
						<div class="overflow-x-scroll rounded-md border border-gray-200 snap-x snap-mandatory">
							${renderStages()}
						</div>
						${iParticipate ? quitButton : ''}
					</aside>

					<div class="col-span-3 grid place-content-center">
						<ft-pong-remote></ft-pong-remote>
					</div>
				</div>
			`
		}
	},
)
