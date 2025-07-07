import fp from 'fastify-plugin'
import { userSessionHook } from '../controllers/user.js'
import { authRoute } from './auth.js'
import { invitationsRoute } from './invitations.js'
import { usersRoute } from './users.js'
import { statsRoute } from './stats.js'

export default fp((server, options, done) => {
	server.addHook('preHandler', userSessionHook)
	server.register(authRoute, { prefix: '/auth' })
	server.register(usersRoute, { prefix: '/users' })
	server.register(invitationsRoute, { prefix: '/invitations' })
	server.register(statsRoute, { prefix: '/stats' })
	done()
})
