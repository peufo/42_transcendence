import { exit } from 'node:process'
import * as p from '@clack/prompts'
import type { UserWithTournament } from '../lib/type.js'
import { api } from './api.js'
import { login, logout } from './auth.js'
import { startGameLocal } from './gameLocal.js'
import type { Scope, ScopeOptions } from './main.js'
import { menuFriendships } from './menuFriendships.js'
import {
	menuNewTournament,
	testRenderStages,
	useMenuTournament,
} from './menuTournament.js'

let user: UserWithTournament | undefined

export const menuMain: Scope = async () => {
	const options: ScopeOptions = []

	options.push({ label: 'prout', value: testRenderStages })

	if (!api.user()) {
		options.push({ label: 'Login', value: login })
	} else {
		options.push({ label: 'Logout', value: logout })
		options.push({ label: 'Friendships', value: menuFriendships })
		user = await api.get('/auth/user')
		const tournamentId = user?.tournament?.id
		if (tournamentId) {
			options.push({
				label: 'Return to tournament',
				value: () => useMenuTournament(tournamentId),
			})
			options.push({
				label: 'Quit tournament',
				value: async () => {
					await api.post('/tournaments/quit', { tournamentId })
					p.log.success('You left tournament')
					return menuMain
				},
			})
		} else {
			options.push({ label: 'New tournament', value: menuNewTournament })
		}
	}
	options.push(
		{ value: startGameLocal, label: 'Local game' },
		{ value: exit, label: 'Exit' },
	)
	const action = await p.select({
		message: 'Main menu',
		options,
	})
	if (p.isCancel(action)) exit()
	return action
}
