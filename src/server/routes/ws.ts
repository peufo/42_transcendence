import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import type { SessionEvent } from '../../lib/type.js'
import { getSessionFromRequest } from '../controllers/hooks.js'
import { createSessionEvent } from '../events/session.js'

const sessionsEventKeys: (keyof SessionEvent)[] = [
	'onInvitationCreated',
	'onInvitationAccepted',
]

export const wsRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.get('/session', { websocket: true }, async (socket, req) => {
		const session = await getSessionFromRequest(req)
		if (!session) {
			socket.close(3000, 'Authentification required')
			return
		}
		const sessionEvent = createSessionEvent(session.id)
		function createEventSender<K extends keyof SessionEvent>(eventName: K) {
			const sender = (data: SessionEvent[K]) => {
				socket.send(JSON.stringify({ [eventName]: data }))
			}
			// @ts-ignore
			sessionEvent.on(eventName, sender)
			// @ts-ignore
			return () => sessionEvent.off(eventName, sender)
		}
		const sendersOff = sessionsEventKeys.map(createEventSender)
		socket.on('close', (_message) => {
			for (const senderOff of sendersOff) senderOff()
		})
	})

	done()
}
