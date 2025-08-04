import { eq } from 'drizzle-orm'
import { db, users } from '../../db/index.js'

export async function setUserIsActive(userId: number, isActive: boolean) {
	await db.update(users).set({ isActive }).where(eq(users.id, userId))
}
