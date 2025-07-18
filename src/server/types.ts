import 'fastify'
import type {
	friendships,
	matches,
	sessions,
	users,
} from '../server/db/schema.js'

type Columns<T> = Partial<{ [k in keyof T]: boolean }>

export type User = typeof users.$inferSelect
export type UserColumns = Columns<User>
export type UserCreate = typeof users.$inferInsert
export type Friendship = typeof friendships.$inferInsert
export type Session = typeof sessions.$inferSelect
export type SessionCreate = typeof sessions.$inferInsert
export type Match = typeof matches.$inferSelect

declare module 'fastify' {
	interface FastifyReply {
		locals?: {
			user?: Omit<User, 'passwordHash'>
			sessionId?: string
		}
	}
}
