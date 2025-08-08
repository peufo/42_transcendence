import type { FastifyReply } from 'fastify'
import type { User } from '../../lib/type.js'
import { server } from '../server.js'
import type { DB } from '../types.js'

export const permission = {
	user(res: FastifyReply): User {
		const user = res.locals?.user
		if (!user) throw server.httpErrors.unauthorized()
		return user
	},
	session(res: FastifyReply): DB.Session {
		const session = res.locals?.session
		if (!session) throw server.httpErrors.unauthorized()
		return session
	},
}
