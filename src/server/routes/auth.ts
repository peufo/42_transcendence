import argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { success, z } from 'zod/v4'
import { createAvatarPlaceholder } from '../controllers/avatar.js'
import { createSession } from '../controllers/session.js'
import { db, users } from '../db/index.js'
import '@fastify/cookie'
import '../types.js'

export const authRoute: FastifyPluginCallbackZod = (server, options, done) => {
	server.post(
		'/login',
		{
			schema: {
				body: z.object({
					name: z.string().min(3),
					password: z.string().min(8),
				}),
			},
		},
		async (req, res) => {
			const { name, password } = req.body
			let [user] = await db.select().from(users).where(eq(users.name, name))

			if (!user) {
				await db.insert(users).values({
					name,
					passwordHash: await argon2.hash(password),
					avatarPlaceholder: createAvatarPlaceholder(),
				})
				const [newUser] = await db
					.select()
					.from(users)
					.where(eq(users.name, name))
				user = newUser
			} else {
				const passwordCorrect = await argon2.verify(user.passwordHash, password)
				if (!passwordCorrect) {
					return res.status(401).send({ message: 'Error' })
				}
			}

			const { token } = await createSession(user.id)
			console.log({ token })
			res.setCookie('session', token, {
				path: '/',
				signed: true,
			})
			res.send({
				success: true,
				redirect: '/',
				invalidate: ['user'],
			})
		},
	)
	server.post('/logout', async (req, res) => {
		res.clearCookie('session')
		if (res.locals) {
			res.locals.user = undefined
		}
		res.redirect('/')
	})

	server.get('/user', (req, res) => {
		return res.send({ data: res.locals?.user })
	})

	done()
}
