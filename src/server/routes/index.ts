import fp from 'fastify-plugin'
import auth from './auth.js'
import { userSessionHook } from '../controllers/user.js'

export default fp((server, options, done) => {
	server.addHook('preHandler', userSessionHook)
	server.register(auth, { prefix: '/auth' })
	done()
})
