import { drizzle } from 'drizzle-orm/libsql'
import { seed } from 'drizzle-seed'
import { users, friendships } from './schema.js'
import { env } from '../env.js'
import argon2 from 'argon2'
import { createAvatarPlaceholder } from '../controllers/avatar.js'

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
			count: 10,
		},
	}))

	await seed(db, { friendships }).refine((f) => ({
		friendships: {
			columns: {
				user1Id: f.valuesFromArray({
					values: [1, 2, 3],
				}),
				user2Id: f.valuesFromArray({
					values: [4, 5, 6, 7, 8, 9, 10],
				}),
				state: f.valuesFromArray({
					values: ['invited', 'friend'],
				}),
			},
			count: 12,
		},
	}))
}

main()
