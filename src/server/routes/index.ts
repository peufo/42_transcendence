import fp from 'fastify-plugin'
import { allUserStatsRoute } from './allUsersStats/index.js'
import { authHook } from './auth/hooks.js'
import { authRoute } from './auth/index.js'
import { friendshipsRoute } from './friendships/index.js'
import { tournamentsRoute } from './tournaments/index.js'
import { statsRoute } from './userStats/index.js'
import { usersRoute } from './users/index.js'
import { wsRoute } from './ws/index.js'

export default fp((server, _options, done) => {
	server.addHook('preHandler', authHook)
	server.register(authRoute, { prefix: '/auth' })
	server.register(usersRoute, { prefix: '/users' })
	server.register(friendshipsRoute, { prefix: '/friendships' })
	server.register(statsRoute, { prefix: '/userstats' })
	server.register(tournamentsRoute, { prefix: '/tournaments' })
	server.register(wsRoute, { prefix: '/ws' })
	server.register(allUserStatsRoute, { prefix: '/allusersstats' })
	done()
})
