import 'fastify'
import type { sessions, users, friendships } from '../server/db/schema.js'

export type User = typeof users.$inferSelect
export type UserCreate = typeof users.$inferInsert
export type Friendship = typeof friendships.$inferInsert
export type Session = typeof sessions.$inferSelect
export type SessionCreate = typeof sessions.$inferInsert

declare module 'fastify' {
	interface FastifyReply {
		locals?: {
			user?: Omit<User, 'passwordHash'>
		}
	}
}
