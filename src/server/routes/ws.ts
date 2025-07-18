import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import type { SessionEvent } from '../../lib/type.js'
import { getSessionFromRequest } from '../controllers/hooks.js'
import { getOrCreateSessionEvent } from '../events/session.js'

export const wsRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.get('/session', { websocket: true }, async (socket, req) => {
		const session = await getSessionFromRequest(req)
		if (!session) {
			socket.close(3000, 'Authentification required')
			return
		}
		function createEventSender<K extends keyof SessionEvent>(key: K) {
			return (data: SessionEvent[K]) => {
				console.log('send', { [key]: data })
				console.log(socket)
				socket.send(JSON.stringify({ [key]: data }))
			}
		}

		const sessionEvent = getOrCreateSessionEvent(session.id)

		const sendOnNewFriend = createEventSender('onNewFriend')
		sessionEvent.on('onNewFriend', sendOnNewFriend)

		socket.on('close', (_message) => {
			sessionEvent.off('onNewFriend', sendOnNewFriend)
		})
	})

	done()
}
