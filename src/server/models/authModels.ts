import { eq } from 'drizzle-orm'
import { createAvatarPlaceholder } from '../controllers/avatar.js'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import type { DB } from '../types.js'

export async function createUser(
	data: Omit<DB.UserCreate, 'avatarPlaceholder'>,
) {
	const result = await db
		.insert(users)
		.values({
			...data,
			avatarPlaceholder: createAvatarPlaceholder(),
		})
		.returning()

	return result[0]
}

export async function checkUserExists(username: string): Promise<boolean> {
	const results = await db.select().from(users).where(eq(users.name, username))
	if (results.length > 0) return true
	return false
}

export async function getUser(username: string) {
	const result = await db
		.select({
			id: users.id,
			name: users.name,
			avatar: users.avatar,
			avatarPlaceholder: users.avatarPlaceholder,
			isActive: users.isActive,
		})
		.from(users)
		.where(eq(users.name, username))

	return result[0] ?? null
}

export async function getPasswordHash(
	username: string,
): Promise<string | null> {
	const [user] = await db
		.select({
			password: users.passwordHash,
		})
		.from(users)
		.where(eq(users.name, username))
	if (!user) return null
	return user.password
}
