import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import '../types.js'
import { loginUser, signupUser } from '../controllers/authController.js'
import { removeSessionEvent } from '../events/session.js'
import { loginSchema, signupSchema } from '../schemas/authSchema.js'

export const authRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.post('/login', { schema: { body: loginSchema } }, loginUser)
	server.post('/signup', { schema: { body: signupSchema } }, signupUser)
	server.post('/logout', async (_req, res) => {
		const sessionId = res.locals?.sessionId
		if (!sessionId) return res.code(401).send()
		removeSessionEvent(sessionId)
		const now = new Date()
		res.setCookie('session', '', {
			path: '/',
			expires: now,
		})
		if (res.locals) {
			res.locals.user = undefined
		}
		res.send({ success: true })
	})

	server.get('/user', (_req, res) => {
		return res.send({ data: res.locals?.user })
	})

	done()
}
