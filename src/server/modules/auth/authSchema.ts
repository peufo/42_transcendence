import { z } from 'zod'

export const signupSchema = z.object({
	name: z.string().min(3),
	password: z.string().min(8),
})

export const loginSchema = z.object({
	name: z.string().min(3),
	password: z.string().min(8),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type SignupSchema = z.infer<typeof signupSchema>
