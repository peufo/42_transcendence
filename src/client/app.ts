import type { SessionEvent } from '../lib/type.js'
import { toast } from './components/ft-toast.js'
import './components/index.js'
import { createEffect } from './utils/signal.js'
import { getUser, updateInvitations } from './utils/store.js'

let sessionSocket: WebSocket | null = null

createEffect(() => {
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

		if (data.onNewFriend) {
			const { invitation } = data.onNewFriend
			const fromUser =
				invitation.user1Id === user.id ? invitation.user2 : invitation.user1
			toast.info(`New invitation from ${fromUser.name}`)
			updateInvitations((invitations) => [...invitations, invitation])
		}
	})
})
