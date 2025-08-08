import z from 'zod/v4'

export const tournamentSchemaCreate = {
	numberOfPlayers: z.coerce.number(),
}
export const tournamentIdSchema = { tournamentId: z.coerce.number() }
