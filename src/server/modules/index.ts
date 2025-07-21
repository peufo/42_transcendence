import fp from 'fastify-plugin'
import { userSessionHook } from './auth/hook.js'
import { authRoute } from './auth/route.js'
import { invitationsRoute } from './invitation/route.js'
import { usersRoute } from './users/route.js'
import { statsRoute } from '../routes/userStats.js'

export default fp((server, _options, done) => {
	server.addHook('preHandler', userSessionHook)
	server.register(authRoute, { prefix: '/auth' })
	server.register(usersRoute, { prefix: '/users' })
	server.register(invitationsRoute, { prefix: '/invitations' })
	server.register(statsRoute, { prefix: '/userstats' })
	done()
})
