import argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { createAvatarPlaceholder } from '../controllers/avatar.js'
import { createSession } from '../controllers/session.js'
import { db, users } from '../db/index.js'
import '@fastify/cookie'
import '../types.js'

export const authRoute: FastifyPluginCallbackZod = (server, _options, done) => {
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
			res.setCookie('session', token, {
				path: '/',
				signed: true,
			})
			res.send({
				data: null,
			})
		},
	)

	// signup
	// server.post(
	// 	'/signup',
	// 	{
	// 		schema: {
	// 			body: z.object({
	// 				username: z.string(),
	// 				password: z.string(),
	// 				avatar: z.string(),
	// 			}),
	// 		},
	// 	},
	// 	signupUser,
	// )

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
