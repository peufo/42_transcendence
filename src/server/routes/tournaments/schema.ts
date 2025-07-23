import z from 'zod/v4'

export const tournamentSchema = { numberOfPlayers: z.coerce.number() }
