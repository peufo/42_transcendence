import fp from 'fastify-plugin'
import views from './views.js'
import auth from './auth.js'

export default fp(function (server, options, done) {
    server.register(views)
    server.register(auth, { prefix: '/auth' })
    done()
})
