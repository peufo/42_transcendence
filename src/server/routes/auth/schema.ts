import z from 'zod/v4'

export const authSchema = {
	name: z.string().min(3),
	password: z.string().min(8),
}
