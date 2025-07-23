import { exit } from 'node:process'
import * as p from '@clack/prompts'
import { api } from './api.js'
import { login, logout } from './auth.js'
import { start } from './game.js'
import type { Scope, ScopeOptions } from './main.js'
import { menuFriendships } from './menuFriendships.js'
import { menuNewTournament } from './menuTournament.js'

export const menuMain: Scope = async () => {
	const options: ScopeOptions = []

	if (!api.user()) {
		options.push({ label: 'Login', value: login })
	} else {
		options.push({ label: 'Logout', value: logout })
		options.push({ label: 'Friendships', value: menuFriendships })
		options.push({ label: 'New tournament', value: menuNewTournament })
	}
	options.push(
		{ value: start, label: 'Local game' },
		{ value: exit, label: 'Exit' },
	)
	const action = await p.select({ message: 'What you want to do ?', options })
	if (p.isCancel(action)) exit()
	return action
}
