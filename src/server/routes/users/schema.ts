import z from 'zod/v4'
import { sanitize } from '../../utils/sanitize.js'

export const updateUserSchema = {
	name: z.string().min(2).max(24).transform(sanitize).optional(),
	password: z.string().min(8).optional(),
}
