import { eq } from 'drizzle-orm'
import { db, tournaments } from '../../db/index.js'
import { userBasicColumns } from '../../models/friendships.js'
import type { ZodData } from '../../utils.js'
import type { tournamentSchema } from './schema.js'

export async function createTournament(
	data: ZodData<typeof tournamentSchema, { createdBy: number }>,
) {
	const [tournament] = await db
		.insert(tournaments)
		.values({ ...data, state: 'open' })
		.returning()
	return tournament
}

export async function getTournament(id: number) {
	const tournament = await db.query.tournaments.findFirst({
		where: eq(tournaments.id, id),
		with: {
			createdByUser: { columns: userBasicColumns },
			participants: {
				with: { user: { columns: userBasicColumns } },
			},
		},
	})
	if (!tournament) throw Error('Tournament not found') // TODO: HTTP error
	return tournament
}
