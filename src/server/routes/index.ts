import fp from 'fastify-plugin'
import { sessionHook } from '../controllers/hooks.js'
import { authRoute } from './auth.js'
import { friendshipsRoute } from './friendship.js'
import { tournamentsRoute } from './tournament/index.js'
import { statsRoute } from './userStats.js'
import { usersRoute } from './users.js'
import { wsRoute } from './ws.js'

export default fp((server, _options, done) => {
	server.addHook('preHandler', sessionHook)
	server.register(authRoute, { prefix: '/auth' })
	server.register(usersRoute, { prefix: '/users' })
	server.register(friendshipsRoute, { prefix: '/friendships' })
	server.register(statsRoute, { prefix: '/userstats' })
	server.register(tournamentsRoute, { prefix: '/tournaments' })
	server.register(wsRoute, { prefix: '/ws' })
	done()
})
