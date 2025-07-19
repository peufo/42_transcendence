import type { SessionEvent } from '../lib/type.js'
import { toast } from './components/ft-toast.js'
import { createEffect } from './utils/signal.js'
import { getUser, updateFriends, updateInvitations } from './utils/store.js'
import { stringToDate } from './utils/stringToDate.js'

let sessionSocket: WebSocket | null = null

const cleanEffect = createEffect(() => {
	const user = getUser()
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
		if (data.onInvitationCreated) {
			const { friendship } = data.onInvitationCreated
			const fromUser =
				friendship.user1Id === user.id ? friendship.user2 : friendship.user1
			toast.info(`New invitation from ${fromUser.name}`)
			updateInvitations((invitations) => [...invitations, friendship])
		}

		if (data.onInvitationAccepted) {
			const { newFriend } = data.onInvitationAccepted
			toast.success(`${newFriend.name} accepted your invitation`)
			updateFriends((friends) => [...friends, newFriend])
		}

		if (data.onInvitationCancel) {
			const { friendshipId } = data.onInvitationCancel
			updateInvitations((invitations) =>
				invitations.filter(({ id }) => id !== friendshipId),
			)
		}
	})
})

window.addEventListener('unload', () => cleanEffect())
