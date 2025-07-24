import z from 'zod/v4'

export const authSchema = {
	name: z.string().min(2),
	password: z.string().min(8),
	avatarPlaceholder: z.url(),

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
}
