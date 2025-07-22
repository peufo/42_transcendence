import type { SessionEvent } from '../lib/type.js'
import { toast } from './components/ft-toast.js'
import { createEffect } from './utils/signal.js'
import { $friendships, $user } from './utils/store.js'
import { stringToDate } from './utils/stringToDate.js'

let sessionSocket: WebSocket | null = null

const cleanEffect = createEffect(() => {
	const user = $user.get()
	if (!user) {
		if (sessionSocket) sessionSocket = null
		return
	}
	if (sessionSocket) return
	console.log('Open session socket')
	sessionSocket = new WebSocket(`ws://${document.location.host}/ws/session`)

	sessionSocket.addEventListener('message', (event) => {
		const data: Partial<SessionEvent> = JSON.parse(event.data)
		stringToDate(data)
		if (data.onFriendshipCreated) {
			const { friendship } = data.onFriendshipCreated
			toast.info(`New invitation from ${friendship.withUser.name}`)
			$friendships.update((friendships) => [...friendships, friendship])
		}

		if (data.onFriendshipAccepted) {
			const { friendship } = data.onFriendshipAccepted
			toast.success(`${friendship.withUser.name} accepted your invitation`)
			$friendships.update((friendships) =>
				friendships.map((f) => (f.id === friendship.id ? friendship : f)),
			)
		}

		if (data.onFriendshipDeleted) {
			const { friendshipId } = data.onFriendshipDeleted
			$friendships.update((friendships) =>
				friendships.filter(({ id }) => id !== friendshipId),
			)
		}
	})
})

window.addEventListener('unload', () => cleanEffect())
