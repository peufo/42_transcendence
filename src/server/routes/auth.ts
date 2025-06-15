import { FastifyPluginCallback } from 'fastify'

const auth: FastifyPluginCallback = (server, options, done) => {
    server.get('/login', (req, res) => {
        req.session.set('userId', 'Jonas')
        res.locals.user = req.session.get('userId')
        res.send('LOGIN ' + res.locals.user)
    })
    done()
}

export default auth