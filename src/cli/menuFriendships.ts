import { exit } from 'node:process'
import * as p from '@clack/prompts'
import type { FriendshipFriend } from '../lib/type.js'
import { api } from './api.js'
import type { Scope, ScopeOptions } from './main.js'
import { menuMain } from './menuMain.js'
import { menuTournament } from './menuTournament.js'

export const menuFriendships: Scope = async () => {
	const action = await p.select({
		message: 'Friendships',
		options: [
			{ label: 'Return', value: menuMain },
			{ label: 'Friends', value: menuFriends },
			{ label: 'Invitations sent', value: menuInvitationsSended },
			{ label: 'Invitations received', value: menuInvitationsReceived },
			{ label: 'Send a new invitation', value: menuNewInvitation },
		],
	})
	if (p.isCancel(action)) exit(0)
	return action
}

const menuFriends: Scope = async () => {
	const friends = await api.get('/friendships/friend')
	if (!friends.length) {
		p.log.warn('Sorry, You have no Friends !')
		return menuFriendships
	}

	const action = await p.select({
		message: `My friends (${friends.length})`,
		options: [
			{ label: 'Return', value: () => menuMain },
			...friends.map((f) => {
				const {
					withUser: { name, isActive, tournament },
				} = f
				let label = name.padEnd(16)
				if (tournament?.state === 'open') {
					label += '[reachable]'
				} else if (isActive) {
					label += '[online]'
				}
				return {
					label,
					value: () => menuFriend(f),
				}
			}),
		],
	})
	if (p.isCancel(action)) exit(0)

	return action()
}

const menuFriend: Scope<[FriendshipFriend]> = async (friendship) => {
	const options: ScopeOptions = [{ label: 'Return', value: menuFriends }]

	const friend = friendship.withUser
	const { tournament } = friend

	if (tournament?.state === 'open') {
		options.push({
			label: 'Join',
			value: async () => {
				const res = await api.post('/tournaments/join', {
					tournamentId: tournament.id,
				})
				if (!res.success) {
					p.log.error('Tounament join failed')
					return menuFriends
				}
				return menuTournament(tournament.id)
			},
		})
	}

	options.push({
		label: 'Remove this friendship',
		value: async () => {
			const isConfirmed = await p.confirm({ message: 'Are you sure ?' })
			if (p.isCancel(isConfirmed)) {
				exit(0)
			}
			if (isConfirmed) {
				await api.post('/friendships/delete', { friendshipId: friendship.id })
				p.log.success(`${friendship.withUser.name} removed of your friendships`)
			}
			return menuFriends
		},
	})

	const action = await p.select({
		message: `${friendship.withUser.name}'s menu`,
		options,
	})

	if (p.isCancel(action)) {
		exit(0)
	}

	return action
}

const menuInvitationsSended: Scope = async () => {
	const user = api.user()
	const invitations = await api.get('/friendships/invitation')
	const invitationsSended = invitations.filter(
		({ createdBy }) => user?.id === createdBy,
	)
	if (!invitationsSended.length) {
		p.log.warn("You don't have sended any invitation !")
		return menuFriendships
	}

	const options: ScopeOptions = [
		{ label: 'Return', value: () => menuFriendships },
		...invitationsSended.map(({ id, withUser }) => ({
			label: `Invitation sent to ${withUser.name}`,
			async value() {
				const action = await p.select({
					message: `${withUser.name} invitation`,
					options: [
						{ label: 'Do nothing', value: async () => {} },
						{
							label: `Cancel ${withUser.name} invitation`,
							value: async () => {
								await api.post('/friendships/delete', { friendshipId: id })
								p.log.success('Invitation canceled !')
							},
						},
					],
				})
				if (p.isCancel(action)) exit(0)
				await action()
				return menuInvitationsSended
			},
		})),
	]

	const action = await p.select({
		message: `Invitations sent (${invitationsSended.length})`,
		options,
	})
	if (p.isCancel(action)) exit(0)
	return action
}

const menuInvitationsReceived: Scope = async () => {
	const invitations = await api.get('/friendships/invitation')
	const user = api.user()
	const invitationsReceived = invitations.filter(
		({ createdBy }) => user?.id !== createdBy,
	)
	if (!invitationsReceived.length) {
		p.log.warn("You don't have received any invitation !")
		return menuFriendships
	}

	const options: ScopeOptions = [
		{ label: 'Return', value: async () => menuFriendships },
		...invitationsReceived.map(({ id, withUser }) => ({
			label: `Invitation from ${withUser.name}`,
			async value() {
				const action = await p.select({
					message: `What to do with the invitation from ${withUser.name} ?`,
					options: [
						{ label: 'Do nothing', value: async () => {} },
						{
							label: 'Accept',
							value: async () => {
								await api.post('/friendships/accept', { friendshipId: id })
								p.log.success('Invitation accepted !')
							},
						},
						{
							label: 'Refuse',
							value: async () => {
								await api.post('/friendships/delete', { friendshipId: id })
								p.log.success('Invitation refused !')
							},
						},
					],
				})
				if (p.isCancel(action)) exit(0)
				await action()
				return menuInvitationsReceived
			},
		})),
	]

	const action = await p.select({
		message: `My invitations (${invitationsReceived.length})`,
		options,
	})
	if (p.isCancel(action)) exit()
	return action
}

const menuNewInvitation: Scope = async () => {
	const search = await p.text({ message: 'Search a user', defaultValue: '' })
	if (p.isCancel(search)) exit(0)
	const users = await api.get('/users', { search })

	const action = await p.select({
		message: 'Invite a user ?',
		options: [
			{ label: 'Return', value: async () => menuFriendships },
			{ label: 'Search again', value: async () => menuNewInvitation },
			...users.map((user) => ({
				label: `Invite ${user.name}`,
				value: async () => {
					await api.post('/friendships/new', { invitedUserId: user.id })
					p.log.success(`${user.name} invited with success !`)
					return menuFriendships
				},
			})),
		],
	})
	if (p.isCancel(action)) exit(0)
	return action()
}
