import z from 'zod/v4'
import type { Move, Player } from '../../../lib/engine/index.js'
import type { ZodShape } from '../../utils/schema.js'

export const engineInputSchema = z.object({
	player: z.enum(['p1', 'p2']),
	move: z.enum(['down', 'up']),
	value: z.coerce.boolean(),
} satisfies ZodShape<{ player: Player; move: Move; value: boolean }>)
