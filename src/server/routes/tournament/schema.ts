import z from 'zod/v4'

export const tournamentSchema = z.object({ numberOfPlayers: z.coerce.number() })
