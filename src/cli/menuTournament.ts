import { exit, stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'
import * as p from '@clack/prompts'
import chalk from 'chalk'
import type { Match } from '../lib/type.js'
import { api } from './api.js'
import type { Scope } from './main.js'
import { menuMain } from './menuMain.js'
import { socketChannelCLI } from './socketChannelCLI.js'

export const menuNewTournament: Scope = async () => {
	const numberOfPlayers = await p.select({
		message: 'Number of player',
		options: [2, 4, 8, 16].map((nb) => ({ label: nb.toString(), value: nb })),
	})
	if (p.isCancel(numberOfPlayers)) exit(0)

	const { tournamentId } = await api.post('/tournaments/new', {
		numberOfPlayers,
	})

	p.log.success('Tournament created')
	return await useMenuTournament(tournamentId)
}

export async function useMenuTournament(tournamentId: number): Promise<Scope> {
	const rl = createInterface({ input: stdin, terminal: true })
	const tournament = await api.get('/tournaments', {
		tournamentId,
	})
	return new Promise((resolve) => {
		const spinner = p.spinner()
		const stateMessage = () => {
			if (tournament.participants.length === tournament.numberOfPlayers)
				return 'Ready to start'
			return `Waiting for participants (${tournament.participants.length} / ${tournament.numberOfPlayers})`
		}
		spinner.start(stateMessage())

		const tournamentChannel = socketChannelCLI(
			'tournaments',
			{ tournamentId: tournamentId.toString() },
			{
				onParticipantJoin(data) {
					tournament.participants.push(data)
					spinner.stop(`${data.user.name} joined the tournament`)
					spinner.start(stateMessage())
				},
				onParticipantQuit(data) {
					tournament.participants = tournament.participants.filter(
						({ user }) => user.id !== data.user.id,
					)
					spinner.stop(`${data.user.name} leaved the tournament`)
					spinner.start(stateMessage())
				},
				onStart(data) {
					spinner.stop('Tournament starting')
					tournament.stages = data.stages
					renderStages([...tournament.stages].reverse())
					// const myMatch = getMyMatch(stages)
					// if (!myMatch) return
					// setMatchId(myMatch.id)
					// $stages.set(stages)
					// $tournament.update((t) => {
					// 	if (!t) return undefined
					// 	return { ...t, state: 'ongoing' }
					// })
				},
				onMatchChange(_data) {},
				onEnd(_data) {},
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
	if (!stages[level]) return
	renderMatchVersus(stages[level][index], level)
	renderStages(stages, level + 1, index * 2)
	if (level > 0) {
		index++
		renderMatchVersus(stages[level][index], level)
		renderStages(stages, level + 1, index * 2)
	}
}

function renderMatchVersus(match: Match, level: number) {
	stdout.write(chalk.gray('│'))
	stdout.write(chalk.grey(`${' │ '.repeat(level)} 1/${2 ** level} `))
	renderPlayer(match, 'player1')
	stdout.write(chalk.italic.grey(' vs '))
	renderPlayer(match, 'player2')
	stdout.write('\n')
}

function renderPlayer(match: Match, p: 'player1' | 'player2') {
	if (!match[p]) {
		stdout.write('?')
		return
	}
	const opponent = p === 'player1' ? 'player2' : 'player1'
	const score = match[`${p}Score`]
	const scoreOpponent = match[`${opponent}Score`]
	let str = `${match[p].name}(${score})`
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
