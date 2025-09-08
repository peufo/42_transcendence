import z from 'zod/v4'

export const tournamentSchemaCreate = {
	numberOfPlayers: z.coerce.number(),
	pointsToWin: z.preprocess(
		(val) => {
			if (typeof val === 'string') {
				try {
					return JSON.parse(val)
				} catch {
					return {}
				}
			}
			return val
		},
		z.object({
			final: z.coerce.number().optional(),
			semifinals: z.coerce.number().optional(),
			quarterfinals: z.coerce.number().optional(),
			eighthfinals: z.coerce.number().optional(),
		}),
	),
}
export const tournamentIdSchema = { tournamentId: z.coerce.number() }
