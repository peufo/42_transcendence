import { getAwaitingMatchFromStages } from '../../lib/tournament.js'
import type { ChannelSocket } from '../../lib/useSocketChannels.js'
import { toast } from '../components/ft-toast.js'
import { socketChannel } from '../socketChannel.js'
import { getAvatarSrc } from '../utils/avatar.js'
import { defineComponent } from '../utils/component.js'
import { setMatch } from '../utils/match.js'
import {
	$match,
	$participants,
	$stages,
	$tournament,
	$user,
} from '../utils/store.js'

defineComponent('ft-page-tournament-play', () => {
	let tournamentChannel: ChannelSocket<'tournaments'>

	const buttonsLab = Object.entries({
		$user,
		$tournament,
		$stages,
		$participants,
		$match,
	}).map(([key, value]) => {
		const btn = document.createElement('button')
		btn.addEventListener('click', () => {
			// biome-ignore lint/suspicious/noExplicitAny: va chier
			value.update((v: any) => v)
		})
		btn.classList.add('btn', 'btn-border')
		btn.innerHTML = key
		return btn
	})

	return {
		onMount() {
			console.log('TOURNAMENT PLAY MOUNT')
			const tournamentId =
				new URLSearchParams(document.location.search).get('tournamentId') || ''

			tournamentChannel = socketChannel(
				'tournaments',
				{ tournamentId },
				{
					onParticipantJoin(newParticipant) {
						console.log('onParticipantJoin')
						toast.success(`${newParticipant.user.name} joined the tournament !`)
						$participants.update((participants) => {
							const isParticipantExist = participants.find(
								({ user }) => user.id === newParticipant.user.id,
							)
							if (isParticipantExist) return participants
							return [...participants, newParticipant]
						})
					},
					onParticipantQuit(participant) {
						console.log('onParticipantQuit')
						toast.error(`${participant.user.name} left the tournament !`)
						$participants.update((participants) => {
							return participants.filter(
								({ user }) => user.id !== participant.user.id,
							)
						})
					},
					onStart({ stages }) {
						console.log('onStart')
						toast.success('Tournament starting')
						$stages.set(stages)
						const userId = $user.get(false)?.id
						if (userId) {
							const myMatch = getAwaitingMatchFromStages(userId, stages)
							setMatch(myMatch)
						}
						$tournament.update((t) => {
							if (!t) return undefined
							return { ...t, state: 'ongoing' }
						})
					},
					onMatchChange({ match }) {
						const userId = $user.get(false)?.id
						console.log('onMatchChange')
						$stages.update((stages) => {
							const m = stages.flat().find((m) => m.id === match.id)
							if (!m) return stages
							Object.assign(m, match)
							if (m.player1Id === userId || m.player2Id === userId) {
								setMatch(m)
							}
							return stages
						})
					},
					onEnd() {
						console.log('onEnd')
						toast.success('Tournament finished')
						$tournament.update((t) => (!t ? t : { ...t, state: 'finished' }))
					},
				},
			)
		},
		onRender(element) {
			const lab = element.querySelector('#lab')
			lab?.append(...buttonsLab)
		},
		onDestroy() {
			tournamentChannel.close()
		},
		render() {
			console.log('TOURNAMENT PLAY RENDER')
			const tournament = $tournament.get()
			if (!tournament) return /*html*/ `<span>Tournament not found</span>`
			return `<h1 class="p-2 flex font-bold item-center justify-center">${tournament.createdByUser.name}'s tournament</h1>
			<ft-tournament-${tournament.state}></ft-tournament-${tournament.state}>`
		},
	}
})

defineComponent('ft-tournament-open', () => {
	return {
		onMount() {
			console.log('TOURNAMENT OPEN MOUNT')
		},
		render() {
			console.log('TOURNAMENT OPEN RENDER')
			const tournament = $tournament.get()
			const user = $user.get()
			if (!tournament) return /*html*/ `<span>Tournament not found</span>`
			if (!user) return ''
			const participants = $participants.get()
			participants.sort(
				(prev, curr) =>
					new Date(prev.joinedAt).getTime() - new Date(curr.joinedAt).getTime(),
			)
			const iParticipate = participants.find(
				({ user: { id } }) => id === user?.id,
			)
			const action = iParticipate ? 'quit' : 'join'
			const buttonText = action === 'quit' ? 'Quit' : 'Join'

			const participationForm = /*html*/ `
				<form action="/tournaments/${action}" method="post" class="contents">
					<input type="hidden" name="tournamentId" value="${tournament.id}" />
					<input type="submit" value="${buttonText}" class="btn btn-border cursor-pointer">
				</form>
			`

			const participantsCountColor =
				participants.length === tournament.numberOfPlayers
					? 'text-lime-400 font-bold a'
					: 'text-gray-400'

			const participantsCount = /*html*/ `
			<div class="p-2 flex item-center justify-center ${participantsCountColor}">
				${participants.length}
				/ ${tournament.numberOfPlayers} players
			</div>
			`

			const participantList = () => {
				let html = /*html*/ `<div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">`
				let number = 0
				for (const participant of participants) {
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
				const numberOfPlayers = tournament?.numberOfPlayers || 0
				while (number < numberOfPlayers) {
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
			let startButton = ``
			if (
				user.id === participants[0].user.id &&
				participants.length === tournament.numberOfPlayers
			)
				startButton = /*html*/ `
				<form action="/tournaments/start" method="post" class="contents">
					<input type="hidden" name="tournamentId" value="${tournament.id}" />
					<input type="submit" class="btn btn-border cursor-pointer" value="Start">
				</form>
				`

			return /*html*/ `
				<div class="flex flex-col gap-3 mt-10 sm:mx-auto sm:max-w-lg mx-4">
					${participantsCount}
					${participantList()}
					${participationForm}
					${startButton}
				</div>
			`
		},
	}
})

customElements.define(
	'ft-tournament-ongoing',
	class extends HTMLElement {
		pongRemoteDiv: HTMLDivElement | null
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.innerHTML = /*html*/ `
				<div class="grid grid-cols-4 gap-4 p-4 min-w-[1360px]">
					<ft-bracket></ft-bracket>
					<div id="pong-remote-div" class="col-span-3"></div>
				</div>
			`
			this.pongRemoteDiv =
				this.querySelector<HTMLDivElement>('#pong-remote-div')
			this.cleanEffect = createEffect(() => {
				console.log('RENDER TOURNAMENT ONGOING')
				const match = $match.get()
				if (!this.pongRemoteDiv) return
				if (match)
					this.pongRemoteDiv.innerHTML = '<ft-pong-remote></ft-pong-remote>'
				else this.pongRemoteDiv.innerHTML = ''
			})
		}
		disconnectedCallback() {
			this.cleanEffect()
		}
	},
)

customElements.define(
	'ft-tournament-finished',
	class extends HTMLElement {
		private user = $user.get()

		connectedCallback() {
			console.log('RENDER TOURNAMENT FINISHED')
			this.innerHTML = this.render()
		}

		render(): string {
			const stages = $stages.get()
			const final = stages[stages.length - 1][0]
			if (!this.user) return 'No user'
			const IWin =
				(this.user.id === final.player1Id &&
					final.player1Score > final.player2Score) ||
				(this.user.id === final.player2Id &&
					final.player2Score > final.player1Score)
			const color = IWin ? 'text-indigo-600 animate-bounce' : 'text-black'
			return /*html*/ `
			<div class="flex flex-col justify-center items-center gap-10">
				<div class="flex flex-col justify-center items-center gap-10">
					<div>
						<ft-icon name="trophy" class="h-50 w-50 stroke-yellow-500"></ft-icon>
					</div>
					<div class="font-bold text-2xl">And the winner is ...</div>
					<div class="font-bold text-4xl ${color}">${final.player1Score > final.player2Score ? final.player1?.name : final.player2?.name} !</div>
				</div>
				<ft-bracket></ft-bracket>
				<a href="/me" class="btn btn-border flex shrink-0 flex-nowrap">
						<ft-icon name="home"></ft-icon>
						<span>Exit</span>
					</a>
			</div>
			`
		},
	}
})
