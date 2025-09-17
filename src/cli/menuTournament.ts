import { exit, stdin, stdout } from 'node:process'
import { createInterface, emitKeypressEvents } from 'node:readline'
import { DatabaseSync } from 'node:sqlite'
import * as p from '@clack/prompts'
import chalk from 'chalk'
import type {
	EngineEventData,
	EngineOptionsEvents,
	Move,
	Player,
} from '../lib/engine/index.js'
import { getAwaitingMatchFromStages } from '../lib/tournament.js'
import type { Match } from '../lib/type.js'
import type { ChannelSocket } from '../lib/useSocketChannels.js'
import { api } from './api.js'
import type { Scope } from './main.js'
import { menuMain } from './menuMain.js'
import { useRenderer } from './renderer.js'
import { ensureSreenSize } from './resolution.js'
import { socketChannelCLI } from './socketChannelCLI.js'

export const menuNewTournament: Scope = async () => {
	const numberOfPlayers = await p.select({
		message: 'Number of player',
		options: [2, 4, 8, 16].map((nb) => ({ label: nb.toString(), value: nb })),
	})
	if (p.isCancel(numberOfPlayers)) exit(0)

	const { tournamentId } = await api.post('/tournaments/new', {
		numberOfPlayers,
		// TODO: make selectable ?
		pointsToWin: {
			final: 7,
			semifinals: 5,
			quarterfinals: 3,
			eighthfinals: 2,
		},
	})

	p.log.success('Tournament created')
	return await menuTournament(tournamentId)
}

export const menuTournament: Scope<[number]> = async (tournamentId) => {
	const rl = createInterface({ input: stdin, terminal: true })
	const tournament = await api.get('/tournaments', {
		tournamentId,
	})
	return new Promise((resolve) => {
		const spinner = p.spinner()
		const stateMessage = () => {
			tournament.participants.sort(
				(prev, curr) =>
					new Date(prev.joinedAt).getTime() - new Date(curr.joinedAt).getTime(),
			)
			const userId = api.user()?.id
			if (
				userId === tournament.participants[0].user.id &&
				tournament.participants.length === tournament.numberOfPlayers
			) {
				return null
			} else {
				return `Waiting for participants (${tournament.participants.length} / ${tournament.numberOfPlayers})`
			}
		}

		const renderTournamentOpen = async (stopMessage?: string) => {
			if (stopMessage) spinner.stop(stopMessage)
			const message = stateMessage()
			if (!message) {
				await p.select({
					message: 'Game ready to start',
					options: [{ value: 'Press enter to start tournament' }],
				})
				await api.post('/tournaments/start', {
					tournamentId,
				})
			} else {
				spinner.start(message)
			}
		}

		const renderTournamentOngoing = (match: Match | undefined) => {
			if (!match) {
				console.log('You have been eliminated') // TODO: fix
				return
			}

			let matchChannel: ChannelSocket<'matches'>
			const userId = api.user()?.id
			const player: Player = userId === match.player1Id ? 'p1' : 'p2'

			ensureSreenSize().then(() => {
				console.clear()
				let renderer: Required<EngineOptionsEvents> & {
					stop: () => void
					onEngineEvent: (data: EngineEventData) => void
				}
				matchChannel = socketChannelCLI(
					'matches',
					{ matchId: match.id.toString() },
					{
						matchReady(_data) {
							renderer = useRenderer()
						},
						onEngineEvent(data) {
							renderer.onEngineEvent(data)
						},
					},
				)
			})

			const setInput = (move: Move, value: boolean) => {
				matchChannel.emit('onPlayerInput', { player, move, value })
			}

			const keyHandlers: Record<string, () => void> = {
				w: () => {
					setInput('up', true)
					setInput('down', false)
				},
				s: () => {
					setInput('up', false)
					setInput('down', false)
				},
				x: () => {
					setInput('up', false)
					setInput('down', true)
				},
			}

			function onKeyPress(key: string) {
				console.log(key)
				keyHandlers[key]?.()
			}

			// TODO: terminate ?
			createInterface({ input: stdin, terminal: true })
			emitKeypressEvents(stdin)
			stdin.on('keypress', onKeyPress)
		}

		if (tournament.state === 'open') renderTournamentOpen()
		if (tournament.state === 'ongoing') {
			api.get('/tournaments', { tournamentId }).then((tournament) => {
				const userId = api.user()?.id
				if (!userId) return
				const match = getAwaitingMatchFromStages(userId, tournament.stages)
				renderTournamentOngoing(match)
			})
		}

		const tournamentChannel = socketChannelCLI(
			'tournaments',
			{ tournamentId: tournamentId.toString() },
			{
				onParticipantJoin(data) {
					tournament.participants.push(data)
					renderTournamentOpen(`${data.user.name} joined the tournament`)
				},
				onParticipantQuit(data) {
					tournament.participants = tournament.participants.filter(
						({ user }) => user.id !== data.user.id,
					)
					renderTournamentOpen(`${data.user.name} left the tournament`)
				},
				onStart({ stages }) {
					spinner.stop('Tournament starting')
					tournament.stages = stages
					renderStages([...tournament.stages].reverse())
					const userId = api.user()?.id
					if (!userId) {
						throw new Error('User is not supposed to be here.')
					}
					const match = getAwaitingMatchFromStages(userId, stages)
					renderTournamentOngoing(match)

					// if (!myMatch) return
					// setMatchId(myMatch.id)
					// $stages.set(stages)
					// $tournament.update((t) => {
					// 	if (!t) return undefined
					// 	return { ...t, state: 'ongoing' }
					// })
				},
				onMatchChange({ match }) {
					const userId = api.user()?.id
					if (!userId) {
						throw new Error('User is not supposed to be here.')
					}
					if (
						match.state === 'awaiting' &&
						(match.player1Id === userId || match.player2Id === userId)
					) {
						renderTournamentOngoing(match)
					}

					// console.log('onMatchChange')
					// $stages.update((stages) => {
					// 	const m = stages.flat().find((m) => m.id === match.id)
					// 	if (!m) return stages
					// 	Object.assign(m, match)
					// 	if (
					// 		m.player1Id === this.user?.id ||
					// 		m.player2Id === this.user?.id
					// 	) {
					// 		setMatch(m)
					// 	}
					// 	return stages
					// })
				},
				onEnd(_data) {
					// console.log('onEnd')
					// toast.success('Tournament terminated')
					// $tournament.update((t) => (!t ? t : { ...t, state: 'finished' }))
				},
			},
		)

		function terminate() {
			tournamentChannel.close()
			rl.off('SIGINT', terminate)
			resolve(menuMain)
		}

		rl.once('SIGINT', terminate)
	})
}

function renderStages(stages: Match[][], level = 0, index = 0) {
	if (!stages || !stages[level]) return
	renderMatchVersus(stages[level][index], level)
	renderStages(stages, level + 1, index * 2)
	if (level > 0) {
		index++
		renderMatchVersus(stages[level][index], level)
		renderStages(stages, level + 1, index * 2)
	}
}

function renderMatchVersus(match: Match | undefined, level: number) {
	stdout.write(chalk.gray('│'))
	stdout.write(chalk.grey(`${' │ '.repeat(level)} 1/${2 ** level} `))
	renderPlayer(match, 'player1')
	stdout.write(chalk.italic.grey(' vs '))
	renderPlayer(match, 'player2')
	stdout.write('\n')
}

function renderPlayer(match: Match | undefined, p: 'player1' | 'player2') {
	if (!match || !match[p]) {
		stdout.write('?')
		return
	}
	const opponent = p === 'player1' ? 'player2' : 'player1'
	const score = match[`${p}Score`]
	const scoreOpponent = match[`${opponent}Score`]
	let str = `${match[p]?.name || p}(${score})`
	if (score !== scoreOpponent) {
		str = score > scoreOpponent ? chalk.green(str) : chalk.red(str)
	}
	stdout.write(str)
}

export async function testRenderStages(): Promise<Scope> {
	const tournament = await api.get('/tournaments', { tournamentId: 1 })
	renderStages([...tournament.stages].reverse())
	return menuMain
}
