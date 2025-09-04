import z from 'zod/v4'

export const matchIdSchema = { matchId: z.coerce.number() }
export const scoreToWinSchema = { scoreToWin: z.coerce.number().min(1).max(10) }
