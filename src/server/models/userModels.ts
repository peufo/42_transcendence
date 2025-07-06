import { eq } from 'drizzle-orm'
import { createAvatarPlaceholder } from '../controllers/avatar.js'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'

export async function createUser(
	username: string,
	password: string,
	avatar: string,
) {
	const avatarPh = createAvatarPlaceholder()
	await db.insert(users).values({
		name: username,
		passwordHash: password,
		avatar: avatar,
		avatarPlaceholder: avatarPh,
	})
	if (await checkUserExists(username)) return 1
	return 0
}

export async function checkUserExists(username: string): Promise<boolean> {
	const results = await db.select().from(users).where(eq(users.name, username))

	if (results.length > 0) return true
	return false
}
