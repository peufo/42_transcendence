import { exit } from 'node:process'
import * as p from '@clack/prompts'
import { api } from './api.js'
import { login, logout } from './auth.js'
import { start } from './game.js'
import type { Scope, ScopeOptions } from './main.js'
import { menuFriendships } from './menuFriendships.js'

export const menuMain: Scope = async () => {
	const options: ScopeOptions = []

	if (!api.user()) {
		options.push({ value: login, label: 'Login' })
	} else {
		options.push({ value: menuFriendships, label: 'Friendships' })
		options.push({ value: logout, label: 'Logout' })
	}
	options.push(
		{ value: start, label: 'Start game' },
		{ value: exit, label: 'Exit' },
	)
	const action = await p.select({ message: 'What you want to do ?', options })
	if (p.isCancel(action)) exit()
	return action
}
