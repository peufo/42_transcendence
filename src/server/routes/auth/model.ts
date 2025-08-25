import argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import type { RoutesPost } from '../../../lib/type.js'
import { db, sessions, users } from '../../db/index.js'

export async function getAuthUser(name: string) {
	const result = await db.query.users.findFirst({
		where: eq(users.name, name),
	})
	return result
}

export async function createUser(data: RoutesPost['/auth/signup']['body']) {
	const { name, password, avatarPlaceholder } = data
	const [createdUser] = await db
		.insert(users)
		.values({
			name,
			passwordHash: await argon2.hash(password),
			avatarPlaceholder,
			isOAuth2: false,
		})
		.returning()
	const { passwordHash, ...user } = createdUser
	return user
}

export async function createUserOAuth2(data: {
	name: string
	avatarUrl: string
}) {
	const { name, avatarUrl } = data
	const [createdUser] = await db
		.insert(users)
		.values({
			name,
			passwordHash: null,
			avatarPlaceholder: avatarUrl,
			isOAuth2: true,
		})
		.returning()
	return createdUser
}

export function createAvatarPlaceholder() {
	const avatarUrl = new URL('https://api.dicebear.com/9.x/bottts-neutral/svg')
	avatarUrl.searchParams.append('seed', String(Math.random()))
	return avatarUrl.toString()
}

export async function getUserSessions(userId: number) {
	return db.query.sessions.findMany({
		where: eq(sessions.userId, userId),
	})
}
