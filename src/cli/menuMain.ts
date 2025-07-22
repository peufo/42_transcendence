import { exit } from 'node:process'
import * as p from '@clack/prompts'
import { api } from './api.js'
import { login, logout } from './auth.js'
import { start } from './game.js'
import type { Scope, ScopeOptions } from './main.js'
import { menuFriends, menuInvitations } from './menuFriendships.js'

export const menuMain: Scope = async () => {
	const options: ScopeOptions = []

	if (!api.user()) {
		options.push({ value: login, label: 'Login' })
	} else {
		options.push({ value: menuFriends, label: 'View friends' })
		options.push({ value: menuInvitations, label: 'View invitations' })
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
