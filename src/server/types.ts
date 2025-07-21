import 'fastify'
import type {
	friendships,
	matches,
	sessions,
	users,
} from '../server/db/schema.js'

export type User = typeof users.$inferSelect
export type UserCreate = typeof users.$inferInsert
export type Friendship = typeof friendships.$inferInsert
export type Session = typeof sessions.$inferSelect
export type SessionCreate = typeof sessions.$inferInsert
export type Match = typeof matches.$inferSelect

declare module 'fastify' {
	interface FastifyReply {
		locals?: {
			user?: Omit<User, 'passwordHash'>
		}
	}

	interface FastifyRequest {
		cookies: Record<string, string> | undefined
		unsignCookie: (value: string) => { valid: boolean; value: string }
	}
}
