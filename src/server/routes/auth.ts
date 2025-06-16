import type { FastifyPluginCallback } from 'fastify'
import { createSession, validateSessionToken } from '../controllers/session.js'

const auth: FastifyPluginCallback = (server, options, done) => {
	server.post('/register', (req, res) => {})
	server.get('/login', (req, res) => {
		req.session.set('userId', 'Jonas')
		res.locals.user = req.session.get('userId')
		res.send(`LOGIN ${res.locals.user}`)
	})
	done()
}

export default auth
