import { exit, stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'
import * as p from '@clack/prompts'
import chalk from 'chalk'
import { getCurrentMatchFromStages } from '../lib/tournament.js'
import type { Match, TournamentWithLookup } from '../lib/type.js'
import { api } from './api.js'
import type { Scope } from './main.js'
import { menuMain } from './menuMain.js'
import { menuMatchRemote } from './menuMatchRemote.js'
import { socketChannelCLI } from './socketChannelCLI.js'
import { wait } from './wait.js'

const stagesByPlayers: Record<number, string[]> = {
	2: ['Final'],
	4: ['Semifinals', 'Final'],
	8: ['Quarterfinals', 'Semifinals', 'Final'],
	16: ['Eighthfinals', 'Quarterfinals', 'Semifinals', 'Final'],
}

const defaultsScoresToWin: Record<string, number> = {
	Final: 7,
	Semifinals: 5,
	Quarterfinals: 3,
	Eighthfinals: 2,
}

export const menuNewTournament: Scope = async () => {
	const numberOfPlayers = await p.select({
		message: 'Number of player',
		options: [2, 4, 8, 16].map((nb) => ({ label: nb.toString(), value: nb })),
	})
	if (p.isCancel(numberOfPlayers)) exit(0)
	const pointsToWin: {
		final?: number
		semifinals?: number
		quarterfinals?: number
		eighthfinals?: number
	} = {}

	for (const stageName of stagesByPlayers[numberOfPlayers]) {
		const key = stageName.toLowerCase() as
			| 'final'
			| 'semifinals'
			| 'quarterfinals'
			| 'eighthfinals'
		const result = await p.select({
			message: `Points to win in ${stageName}`,
			options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((nb) => ({ value: nb })),
			initialValue: defaultsScoresToWin[stageName],
		})
		if (p.isCancel(result)) exit(0)
		pointsToWin[key] = result
	}

	const { tournamentId } = await api.post('/tournaments/new', {
		numberOfPlayers,
		pointsToWin,
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
				const r = await p.select({
					message: 'Game ready to start',
					options: [{ value: 'Press enter to start tournament' }],
				})
				if (p.isCancel(r)) exit(0)
				await api.post('/tournaments/start', {
					tournamentId,
				})
			} else {
				spinner.start(message)
			}
		}

		function tryStartMatch() {
			const userId = api.user()?.id
			if (!userId) {
				throw new Error('User is not supposed to be here.')
			}
			renderStages([...tournament.stages].reverse())
			wait(3000).then(() => {
				const match = getCurrentMatchFromStages(userId, tournament.stages)
				if (match) {
					terminate(() => menuMatchRemote(match))
				}
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
					tryStartMatch()
				},
				onMatchChange({ match }) {
					const m = tournament.stages.flat().find((m) => m.id === match.id)
					if (m) Object.assign(m, match)
					tryStartMatch()
				},
				onEnd() {
					terminate(() => menuTournamentFinished(tournament))
				},
			},
		)

		if (tournament.state === 'open') renderTournamentOpen()
		if (tournament.state === 'ongoing') {
			tryStartMatch()
		}
		if (tournament.state === 'finished') {
			terminate(() => menuTournamentFinished(tournament))
		}

		function terminate(nextScope: Scope = menuMain) {
			tournamentChannel.close()
			rl.off('SIGINT', terminate)
			resolve(nextScope)
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

const menuTournamentFinished: Scope<[TournamentWithLookup]> = async (
	tournament,
) => {
	renderStages([...tournament.stages].reverse())

	const final = tournament.stages[tournament.stages.length - 1][0]
	const winner =
		final.player1Score > final.player2Score
			? final.player1?.name
			: final.player2?.name
	const action = await p.select({
		message: `${winner} won !`,
		options: [{ label: 'Press enter to start tournament', value: menuMain }],
	})
	if (p.isCancel(action)) exit(0)
	return action
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
