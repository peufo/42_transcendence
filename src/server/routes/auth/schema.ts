import z from 'zod/v4'
import { sanitize } from '../../utils/sanitize.js'

export const loginSchema = {
	name: z.string().min(2).transform(sanitize),
	password: z.string().min(8),
}

export const signupSchema = {
	...loginSchema,
	avatarPlaceholder: z.url(),
}

// z.instanceof(File)  .refine(
// (file) =>
//   [
//     "image/png",
//     "image/jpeg",
//     "image/jpg",
//     "image/svg+xml",
//     "image/gif",
//   ].includes(file.type),
// { message: "Invalid image file type" }
//   ),
