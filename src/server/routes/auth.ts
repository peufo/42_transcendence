import type { FastifyPluginCallback } from 'fastify'

const auth: FastifyPluginCallback = (server, options, done) => {
	server.post('/register', (req, res) => {})
	server.get('/login', (req, res) => {
		res.locals.user = 'Alice'
		res.send(`LOGIN ${res.locals.user}`)
	})
	done()
}

export default auth
