import fp from 'fastify-plugin'
import { authRoute } from './auth.js'
import { usersRoute } from './users.js'
import { invitationsRoute } from './invitations.js'
import { userSessionHook } from '../controllers/user.js'

export default fp((server, options, done) => {
	server.addHook('preHandler', userSessionHook)
	server.register(authRoute, { prefix: '/auth' })
	server.register(usersRoute, { prefix: '/users' })
	server.register(invitationsRoute, { prefix: '/invitations' })
	done()
})
