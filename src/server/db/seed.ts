import argon2 from 'argon2'
import { drizzle } from 'drizzle-orm/libsql'
import { seed } from 'drizzle-seed'
import { createAvatarPlaceholder } from '../controllers/avatar.js'
import { env } from '../env.js'
import { friendships, users } from './schema.js'

async function main() {
	const db = drizzle(env.DB_FILE_NAME)
	const passwordHash = await argon2.hash('12341234')

	await seed(db, { users }).refine((f) => ({
		users: {
			columns: {
				avatar: f.default({
					defaultValue: '',
				}),
				avatarPlaceholder: f.valuesFromArray({
					values: new Array(10).fill('').map(createAvatarPlaceholder),
				}),
				passwordHash: f.default({
					defaultValue: passwordHash,
				}),
			},
			count: 20,
		},
	}))

	await seed(db, { friendships }).refine((f) => ({
		friendships: {
			columns: {
				user1Id: f.default({
					defaultValue: 2,
				}),
				user2Id: f.valuesFromArray({
					values: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20],
				}),
				state: f.valuesFromArray({
					values: ['invited', 'friend'],
				}),
				createdBy: f.default({
					defaultValue: 2,
				}),
			},
			count: 6,
		},
	}))

	const invits = [3, 6, 9, 10, 13, 14]
	for (const invitId of invits) {
		await db.insert(friendships).values({
			user1Id: 2,
			user2Id: invitId,
			state: 'invited',
			createdBy: invitId,
		})
	}
}

main()
