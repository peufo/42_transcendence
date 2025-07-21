import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { listFriends } from './controller.js'

export const friendshipRoute: FastifyPluginCallbackZod = (
	server,
	_opts,
	done,
) => {
	server.get('/friends', listFriends)
	done()
}
