import { z } from 'zod'

export const signupSchema = z.object({
	username: z.string().min(3),
	password: z.string().min(8),
	avatar: z.string(),
})

export type SignupSchema = z.infer<typeof signupSchema>
