import argon2 from 'argon2'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import { removeSessionEvent } from '../ws/sessionEvent.js'
import { setSessionCookie } from './controller.js'
import { createUser, getAuthUser } from './model.js'
import { authSchema } from './schema.js'

export const authRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.get('/user', getSchema('/auth/user', null), async (_req, res) => {
		return res.send({ data: res.locals?.user })
	})

	server.post(
		'/login',
		postSchema('/auth/login', authSchema),
		async (req, res) => {
			const { name, password } = req.body
			const authUser = await getAuthUser(name)
			if (!authUser) return res.forbidden('Wrong username or password')
			const passwordOk = await argon2.verify(authUser.passwordHash, password)
			if (!passwordOk) return res.forbidden('Wrong username or password')
			await setSessionCookie(authUser.id, res)
			const { passwordHash, ...user } = authUser
			res.send({ message: 'Connection success !', user })
		},
	)
	server.post(
		'/signup',
		postSchema('/auth/signup', authSchema),
		async (req, res) => {
			const authUser = await getAuthUser(req.body.name)
			if (authUser) return res.forbidden('User already exists.')
			const user = await createUser(req.body)
			await setSessionCookie(user.id, res)
			res.send({ message: 'Signup success !', user })
		},
	)
	server.post(
		'/logout',
		postSchema('/auth/logout', null),
		async (_req, res) => {
			const sessionId = permission.sessionId(res)
			removeSessionEvent(sessionId)
			const now = new Date()
			res.setCookie('session', '', { path: '/', expires: now })
			res.send({ success: true })
		},
	)

	done()
}
