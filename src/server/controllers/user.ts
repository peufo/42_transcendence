import type { preHandlerAsyncHookHandler } from 'fastify'
import { db } from '../db/index.js'
import { validateSessionToken } from './session.js'
import '@fastify/cookie'
import { signupService } from '../services/userService.js'

export const userSessionHook: preHandlerAsyncHookHandler = async (req, res) => {
	try {
		const sessionTokenSigned = req.cookies.session
		if (!sessionTokenSigned) {
			return
		}
		const { valid, value: sessionToken } = req.unsignCookie(sessionTokenSigned)
		if (!valid) {
			return
		}

		const session = await validateSessionToken(sessionToken)
		if (!session) {
			return
		}
		// TODO: user est pas toujours nécéssaire...
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, session?.userId),
			columns: {
				passwordHash: false,
			},
		})
		res.locals = { user }
	} catch (err) {
		console.log(err)
	}
}

import type { FastifyReply, FastifyRequest } from 'fastify'
import { createSession } from './session.js'

interface SignupBody {
	username: string
	password: string
	avatar: string
}

export async function signupUser(
	req: FastifyRequest<{ Body: SignupBody }>,
	res: FastifyReply,
) {
	const { username, password, avatar } = req.body

	try {
		const user = await signupService(username, password, avatar)

		const { token } = await createSession(user.id)

		res.setCookie('session', token, {
			path: '/',
			signed: true,
		})

		res.send({
			status: 200,
			message: 'Inscription réussie !',
			user,
		})
	} catch (err: unknown) {
		res.status(410).send({ message: 'Erreur' })
	}
}
