import z from 'zod/v4'
import { sanitize } from '../../utils/sanitize.js'

export const loginSchema = {
	name: z.string().min(2).max(24).transform(sanitize),
	password: z.string().min(8),
}

export const signupSchema = {
	...loginSchema,
	avatarPlaceholder: z.url(),
}
