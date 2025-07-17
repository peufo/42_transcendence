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

