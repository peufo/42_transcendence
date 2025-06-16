import fp from 'fastify-plugin'
import auth from './auth.js'
import views from './views.js'

export default fp((server, options, done) => {
	server.register(views)
	server.register(auth, { prefix: '/auth' })
	done()
})
