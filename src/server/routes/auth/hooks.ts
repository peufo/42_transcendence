import type { FastifyRequest, preHandlerAsyncHookHandler } from 'fastify'
import { db } from '../../db/index.js'
import type { DB } from '../../types.ts'
import { validateSessionToken } from './controller.js'

export async function getSessionFromRequest(
	req: FastifyRequest,
): Promise<DB.Session | null> {
	const sessionTokenSigned = req.cookies.session
	if (!sessionTokenSigned) return null

	const { valid, value: sessionToken } = req.unsignCookie(sessionTokenSigned)
	if (!valid) return null

	return validateSessionToken(sessionToken)
}

export const authHook: preHandlerAsyncHookHandler = async (req, res) => {
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
