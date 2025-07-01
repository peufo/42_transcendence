import { drizzle } from 'drizzle-orm/libsql'
import { seed } from 'drizzle-seed'
import { users } from './index.js'
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
				avatarPlaceholder: f.default({
					defaultValue: createAvatarPlaceholder(),
				}),
				passwordHash: f.default({
					defaultValue: passwordHash,
				}),
			},
		},
	}))
}

main()
