import argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import type { RoutesPost } from '../../../lib/type.js'
import { db, users } from '../../db/index.js'

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
		})
		.returning()
	const { passwordHash, ...user } = createdUser
	return user
}

export function createAvatarPlaceholder() {
	const avatarUrl = new URL('https://api.dicebear.com/9.x/bottts-neutral/svg')
	console.log(avatarUrl)
	avatarUrl.searchParams.append('seed', String(Math.random()))
	return avatarUrl.toString()
}
