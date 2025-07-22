import type { FastifyReply } from 'fastify'
import type { User } from '../../lib/type.js'
import { server } from '../main.js'

export const permission = {
	authenticated(res: FastifyReply): User {
		const user = res.locals?.user
		if (!user) throw server.httpErrors.unauthorized()
		return user
	},
}
