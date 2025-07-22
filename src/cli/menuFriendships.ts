import { exit } from 'node:process'
import * as p from '@clack/prompts'
import type { FriendshipFriend, FriendshipInvitation } from '../lib/type.js'
import { api } from './api.js'
import type { Scope, ScopeOptions } from './main.js'
import { menuMain } from './menuMain.js'

export const menuFriends: Scope = async () => {
	const friendships = await api.friendships()
	const friends = friendships.filter(
		(friendship) => friendship.state === 'friend',
	) as FriendshipFriend[]
	if (!friends.length) {
		p.log.warn('Sorry, You have no Friends !')
	} else {
		p.note(
			friends
				.map(
					({ withUser: { name, isActive } }) =>
						`${name.padEnd(16)}${isActive ? '[online]' : ''}`,
				)
				.join('\n'),
			`My friends (${friends.length})`,
		)
	}
	return menuMain
}

export const menuInvitations: Scope = async () => {
	const friendships = await api.friendships()
	const invitations = friendships.filter(
		(friendship) => friendship.state === 'invited',
	) as FriendshipInvitation[]
	if (!invitations.length) {
		p.log.warn("You don't have invitation !")
		return menuMain
	}
	const user = api.user()
	const options: ScopeOptions = [{ value: () => menuMain, label: 'Ok' }]
	for (const { id, withUser, createdBy } of invitations) {
		if (user?.id === createdBy) {
			options.push({
				label: `Invitation sended to ${withUser.name}`,
				async value() {
					const message = `Do you want cancel the invitation sended to ${withUser.name} ?`
					const isConfirmed = await p.confirm({ message })
					if (p.isCancel(isConfirmed)) exit()
					if (isConfirmed) {
						await api.friendshipsDelete({ friendshipId: id })
						p.log.success('Invitation canceled !')
					}
					return menuInvitations
				},
			})
			continue
		}
		options.push({
			label: `Invitation from ${withUser.name}`,
			async value() {
				const action = await p.select({
					message: `What to do with the invitation from ${withUser.name} ?`,
					options: [
						{ label: 'Nothing', value: async () => {} },
						{
							label: 'Accept',
							value: async () => {
								await api.friendshipsAccept({ friendshipId: id })
								p.log.success('Invitation accepted !')
							},
						},
						{
							label: 'Reject',
							value: async () => {
								await api.friendshipsDelete({ friendshipId: id })
								p.log.success('Invitation rejected !')
							},
						},
					],
				})
				if (p.isCancel(action)) exit(0)
				await action()
				return menuInvitations
			},
		})
	}

	const action = await p.select({
		message: `My invitations (${invitations.length})`,
		options,
	})
	if (p.isCancel(action)) exit()
	return action
}
