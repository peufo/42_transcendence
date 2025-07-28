import { type ChannelSocket, openChannel } from '../lib/socketChannels.js'
import { toast } from './components/ft-toast.js'
import { createEffect } from './utils/signal.js'
import { $friendships, $user } from './utils/store.js'

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
	friendshipChannel = openChannel('friendships', {
		onCreated({ friendship }) {
			toast.info(`New invitation from ${friendship.withUser.name}`)
			$friendships.update((friendships) => [...friendships, friendship])
		},
		onAccepted({ friendship }) {
			toast.success(`${friendship.withUser.name} accepted your invitation`)
			$friendships.update((friendships) =>
				friendships.map((f) => (f.id === friendship.id ? friendship : f)),
			)
		},
		onDeleted({ friendshipId }) {
			$friendships.update((friendships) =>
				friendships.filter(({ id }) => id !== friendshipId),
			)
		},
	})
})
