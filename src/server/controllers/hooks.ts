import type { FastifyRequest, preHandlerAsyncHookHandler } from 'fastify'
import { db } from '../db/index.js'
import { validateSessionToken } from './session.js'
import '@fastify/cookie'
import type { Session } from '../types.js'

export async function getSessionFromRequest(
	req: FastifyRequest,
): Promise<Session | null> {
	const sessionTokenSigned = req.cookies.session
	if (!sessionTokenSigned) return null

	const { valid, value: sessionToken } = req.unsignCookie(sessionTokenSigned)
	if (!valid) return null

	return validateSessionToken(sessionToken)
}

export const sessionHook: preHandlerAsyncHookHandler = async (req, res) => {
	try {
		const session = await getSessionFromRequest(req)
		if (!session) return

		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, session?.userId),
			columns: {
				passwordHash: false,
			},
		})
		res.locals = { user, sessionId: session.id }
	} catch (err) {
		console.error(err)
	}
}
