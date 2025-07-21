import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import '../../types.js'
import { loginSchema, signupSchema } from './authSchema.js'
import { loginUser, signupUser } from './controller.js'

export const authRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.post('/login', { schema: { body: loginSchema } }, loginUser)
	server.post('/signup', { schema: { body: signupSchema } }, signupUser)
	server.post('/logout', async (_req, res) => {
		const now = new Date()
		res.setCookie('session', '', {
			path: '/',
			expires: now,
		})
		if (res.locals) {
			res.locals.user = undefined
		}
		res.send({
			data: null,
		})
	})

	server.get('/user', (_req, res) => {
		return res.send({ data: res.locals?.user })
	})

	done()
}
