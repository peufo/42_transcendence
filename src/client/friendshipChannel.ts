import { type ChannelSocket, openChannel } from '../lib/socketChannels.js'
import { toast } from './components/ft-toast.js'
import { createEffect } from './utils/signal.js'
import {
	$friendshipsFriend,
	$friendshipsInvitation,
	$user,
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
	friendshipChannel = openChannel('friendships', null, {
		onCreated({ friendship }) {
			toast.info(`New invitation from ${friendship.withUser.name}`)
			$friendshipsInvitation.update((friendships) => [
				...friendships,
				friendship,
			])
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
		onTournamentCreated({ tournament }) {
			$friendshipsFriend.update((friendships) =>
				friendships.map((f) => {
					if (f.withUser.id !== tournament.createdBy) return f
					f.withUser.tournaments.push(tournament)
					toast.info(`${f.withUser.name} created a tournament !`)
					return f
				}),
			)
		},
		onTournamentDeleted({ tournament }) {
			$friendshipsFriend.update((friendships) =>
				friendships.map((f) => {
					if (f.withUser.id !== tournament.createdBy) return f
					f.withUser.tournaments = f.withUser.tournaments.filter(
						(t) => t.id !== tournament.id,
					)
					toast.info(`${f.withUser.name} created a tournament !`)
					return f
				}),
			)
		},
	})
})
