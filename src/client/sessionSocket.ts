import type { SessionEvent } from '../lib/type.js'
import { toast } from './components/ft-toast.js'
import { createEffect } from './utils/signal.js'
import { getUser, updateFriends, updateInvitations } from './utils/store.js'

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

		if (data.onInvitationCreated) {
			const { invitation } = data.onInvitationCreated
			const fromUser =
				invitation.user1Id === user.id ? invitation.user2 : invitation.user1
			toast.info(`New invitation from ${fromUser.name}`)
			updateInvitations((invitations) => [...invitations, invitation])
		}

		if (data.onInvitationAccepted) {
			const { newFriend } = data.onInvitationAccepted
			toast.success(`${newFriend.name} accepted your invitation`)
			updateFriends((friends) => [...friends, newFriend])
		}
	})
})

window.addEventListener('unload', () => cleanEffect())
