import z from 'zod/v4'

export const updateUserSchema = z.object({
	name: z.string().min(2).optional(),
	password: z.string().min(8).optional(),
}).refine(data => data.name || data.password, {
	message: 'Tu dois changer soit le nom, soit le mot de passe',
})

