import 'fastify'
import type {
	friendships,
	matches,
	sessions,
	tournaments,
	users,
	versus,
} from '../server/db/schema.js'

export namespace DB {
	export type Columns<T> = Partial<{ [k in keyof T]: boolean }>
	export type User = typeof users.$inferSelect
	export type UserColumns = Columns<typeof users.$inferSelect>
	export type UserCreate = typeof users.$inferInsert
	export type FriendshipCreate = typeof friendships.$inferInsert
	export type Session = typeof sessions.$inferSelect
	export type SessionCreate = typeof sessions.$inferInsert
	export type Match = typeof matches.$inferSelect
	export type Tournament = typeof tournaments.$inferSelect
	export type TournamentCreate = typeof tournaments.$inferInsert
	export type Versus = typeof versus.$inferSelect
}

declare module 'fastify' {
	interface FastifyReply {
		locals?: {
			user?: Omit<DB.User, 'passwordHash'>
			session?: DB.Session
		}
	}

	interface FastifyRequest {
		cookies: { [cookieName: string]: string | undefined }
		unsignCookie: (value: string) => { valid: boolean; value: string }
	}
}
