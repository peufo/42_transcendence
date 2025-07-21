import type { preHandlerAsyncHookHandler } from 'fastify'
import { db } from '../../db/index.js'
import { HttpError } from '../../utils/HttpError.js'
import { validateSessionToken } from './session.js'

export const userSessionHook: preHandlerAsyncHookHandler = async (req, res) => {
	try {
		const sessionTokenSigned = req.cookies.session
		if (!sessionTokenSigned) {
			throw new HttpError('Missing session cookie', 401)
		}

		const { valid, value: sessionToken } = req.unsignCookie(sessionTokenSigned)
		if (!valid) {
			throw new HttpError('Invalid signed session cookie', 401)
		}

		const session = await validateSessionToken(sessionToken)
		if (!session) {
			throw new HttpError('Invalid or expired session token', 401)
		}

		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, session.userId),
			columns: {
				passwordHash: false,
			},
		})

		if (!user) {
			throw new HttpError('User not found for session', 404)
		}

		res.locals = { user }
	} catch (err) {
		if (err instanceof HttpError) throw err

		throw new HttpError('Internal server error in session hook', 500)
	}
}
