import fp from 'fastify-plugin'
import { userSessionHook } from '../controllers/user.js'
import auth from './auth.js'

export default fp((server, options, done) => {
	server.addHook('preHandler', userSessionHook)
	server.register(auth, { prefix: '/auth' })
	done()
})
