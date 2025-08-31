import type { ChannelSocket } from '../lib/useSocketChannels.js'
import { toast } from './components/ft-toast.js'
import { socketChannel } from './socketChannel.js'
import { createEffect } from './utils/signal.js'
import {
	$friendshipsFriend,
	$friendshipsInvitation,
	$user,
	$users,
} from './utils/store.js'

let friendshipChannel: ChannelSocket<'friendships'> | null = null

createEffect(() => {
	const user = $user.get()
	if (!user) {
		if (friendshipChannel) {
			friendshipChannel.close()
			friendshipChannel = null
		}
		return
	}
	if (friendshipChannel) return
	friendshipChannel = socketChannel('friendships', null, {
		onCreated({ friendship }) {
			toast.info(`New invitation from ${friendship.withUser.name}`)
			$friendshipsInvitation.update((friendships) => [
				...friendships,
				friendship,
			])
			$users.update((users) =>
				users.filter((user) => user.id !== friendship.withUser.id),
			)
		},
		onAccepted({ friendship }) {
			toast.success(`${friendship.withUser.name} accepted your invitation`)
			$friendshipsInvitation.update((invitations) =>
				invitations.filter(({ id }) => id !== friendship.id),
			)
			$friendshipsFriend.update((friendships) => [...friendships, friendship])
		},
		onDeleted({ friendshipId }) {
			$friendshipsInvitation.update((invitations) =>
				invitations.filter(({ id }) => id !== friendshipId),
			)
			$friendshipsFriend.update((friendships) =>
				friendships.filter(({ id }) => id !== friendshipId),
			)
		},
		onTournamentJoin({ tournament, userId }) {
			$friendshipsFriend.update((friendships) =>
				friendships.map((f) => {
					if (f.withUser.id !== userId) return f
					f.withUser.tournament = tournament
					toast.info(`${f.withUser.name} joined a tournament !`)
					return f
				}),
			)
		},
		onTournamentQuit({ userId }) {
			$friendshipsFriend.update((friendships) =>
				friendships.map((f) => {
					if (f.withUser.id !== userId) return f
					f.withUser.tournament = null
					return f
				}),
			)
		},
		onFriendOnline({ userId }) {
			$friendshipsFriend.update((friendships) => {
				friendships.map((f) => {
					if (f.withUser.id !== userId) return f
					f.withUser.isActive = true
					toast.info(`${f.withUser.name} is online !`)
					return f
				})
				return friendships
			})
		},
		onFriendOffline({ userId }) {
			$friendshipsFriend.update((friendships) => {
				friendships.map((f) => {
					if (f.withUser.id !== userId) return f
					f.withUser.isActive = false
					return f
				})
				return friendships
			})
		},
	})
})
