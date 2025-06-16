import 'fastify'
import type { sessions, users } from './db/schema.js'

declare module 'fastify' {
	interface FastifyReply {
		locals: {
			user?: string // TODO: id, name, avatar
		}
	}
}

export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
