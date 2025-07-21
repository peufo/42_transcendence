import type z from 'zod/v4'
import { db, tournaments } from '../../db/index.js'
import type { tournamentSchema } from './schema.ts'

export async function createTournament(
	data: { createdBy: number } & z.infer<typeof tournamentSchema>,
) {
	const [tournament] = await db
		.insert(tournaments)
		.values({ ...data, state: 'open' })
		.returning()
	return tournament
}
