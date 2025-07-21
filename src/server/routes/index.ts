import fp from 'fastify-plugin'
import { userSessionHook } from '../modules/auth/hook.js'
import { authRoute } from '../modules/auth/route.js'
import { invitationsRoute } from '../modules/invitation/route.js'
import { usersRoute } from '../modules/users/route.js'
import { statsRoute } from './userStats.js'

export default fp((server, _options, done) => {
	server.addHook('preHandler', userSessionHook)
	server.register(authRoute, { prefix: '/auth' })
	server.register(usersRoute, { prefix: '/users' })
	server.register(invitationsRoute, { prefix: '/invitations' })
	server.register(statsRoute, { prefix: '/userstats' })
	done()
})
