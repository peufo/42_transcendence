import z from 'zod/v4'

export const updateUserSchema = {
	name: z.string().min(2).or(z.literal('')),
	password: z.string().min(8).or(z.literal('')),
}
