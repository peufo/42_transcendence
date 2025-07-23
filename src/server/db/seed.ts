import argon2 from 'argon2'
import { drizzle } from 'drizzle-orm/libsql'
import { seed } from 'drizzle-seed'
import { env } from '../env.js'
import { createAvatarPlaceholder } from '../routes/auth/model.js'
import {
	friendships,
	matches,
	rounds,
	roundsRelations,
	users,
} from './schema.js'

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

	const FRIENDSHIP_COUNT = 15
	await seed(db, { friendships }).refine((f) => ({
		friendships: {
			columns: {
				user1Id: f.default({
					defaultValue: 2,
				}),
				user2Id: f.valuesFromArray({
					values: new Array(FRIENDSHIP_COUNT).fill(0).map((_, i) => i + 3),
					isUnique: true,
				}),
				state: f.valuesFromArray({
					values: ['invited', 'friend'],
				}),
				createdBy: f.default({
					defaultValue: 2,
				}),
			},
			count: FRIENDSHIP_COUNT,
		},
	}))

	await db.insert(friendships).values({
		user1Id: 2,
		user2Id: 20,
		createdBy: 20,
		state: 'invited',
	})

	await seed(db, { matches, roundsRelations }).refine((f) => ({
		matches: {
			columns: {
				player1Id: f.default({
					defaultValue: 2,
				}),
				player2Id: f.valuesFromArray({
					values: [11, 12, 13, 14, 15, 16, 17, 18, 19],
				}),
				player1Score: f.valuesFromArray({
					values: [0, 1, 2, 3, 4, 5],
				}),
				player2Score: f.valuesFromArray({
					values: [0, 1, 2, 3, 4, 5],
				}),
				pointsToWin: f.default({
					defaultValue: 5,
				}),
			},
			count: 11,
		},
	}))

	await seed(db, { rounds }).refine((f) => ({
		rounds: {
			columns: {
				scorer: f.valuesFromArray({
					values: ['p1', 'p2'],
				}),
				rallyCount: f.int({
					minValue: 2,
					maxValue: 12,
				}),
				ballPositionY: f.weightedRandom([
					{
						weight: 0.2,
						value: f.int({ minValue: 30, maxValue: 60 }),
					},
					{
						weight: 0.4,
						value: f.int({ minValue: 61, maxValue: 99 }),
					},
					{
						weight: 0.4,
						value: f.int({ minValue: 0, maxValue: 29 }),
					},
				]),
				gamestates: f.default({
					defaultValue: '',
				}),
				arenaSettings: f.default({
					defaultValue: '',
				}),
				matchId: f.valuesFromArray({
					values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
				}),
			},
			count: 1000,
		},
		count: 10,
	}))
}

main()
