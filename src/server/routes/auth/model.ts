import argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import { db, users } from '../../db/index.js'
import type { ZodData } from '../../utils/schema.js'
import type { authSchema } from './schema.js'

export function getAuthUser(name: string) {
	return db.query.users.findFirst({
		where: eq(users.name, name),
	})
}

export async function createUser(data: ZodData<typeof authSchema>) {
	const { name, password } = data
	const [createdUser] = await db
		.insert(users)
		.values({
			name,
			passwordHash: await argon2.hash(password),
			avatarPlaceholder: createAvatarPlaceholder(),
		})
		.returning()
	const { passwordHash, ...user } = createdUser
	return user
}

export function createAvatarPlaceholder() {
	const avatarUrl = new URL('https://api.dicebear.com/9.x/bottts-neutral/svg')
	avatarUrl.searchParams.append('seed', String(Math.random()))
	return avatarUrl.toString()
}
