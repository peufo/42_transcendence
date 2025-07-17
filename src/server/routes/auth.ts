import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import '../types.js'
import { loginUser, signupUser } from '../controllers/authController.js'
import { loginSchema, signupSchema } from '../schemas/authSchema.js'

export const authRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.post('/login', { schema: { body: loginSchema } }, loginUser)
	/*
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
					return res.status(401).send({ message: 'Wrong password or username' })
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
	*/

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
