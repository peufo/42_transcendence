import type { FriendshipEvents } from '../lib/type.js'
import { toast } from './components/ft-toast.js'
import { createEffect } from './utils/signal.js'
import { $friendships, $user } from './utils/store.js'
import { stringToDate } from './utils/stringToDate.js'

let friendshipSocket: WebSocket | null = null

const cleanEffect = createEffect(() => {
	const user = $user.get()
	if (!user) {
		if (friendshipSocket) friendshipSocket = null
		return
	}
	if (friendshipSocket) return
	console.log('Open session socket')
	friendshipSocket = new WebSocket(
		`ws://${document.location.host}/ws/friendship`,
	)

	friendshipSocket.addEventListener('message', (event) => {
		const data: Partial<FriendshipEvents> = JSON.parse(event.data)
		stringToDate(data)
		if (data.onCreated) {
			const { friendship } = data.onCreated
			toast.info(`New invitation from ${friendship.withUser.name}`)
			$friendships.update((friendships) => [...friendships, friendship])
		}

		if (data.onAccepted) {
			const { friendship } = data.onAccepted
			toast.success(`${friendship.withUser.name} accepted your invitation`)
			$friendships.update((friendships) =>
				friendships.map((f) => (f.id === friendship.id ? friendship : f)),
			)
		}

		if (data.onDeleted) {
			const { friendshipId } = data.onDeleted
			$friendships.update((friendships) =>
				friendships.filter(({ id }) => id !== friendshipId),
			)
		}
	})
})

window.addEventListener('unload', () => cleanEffect())
