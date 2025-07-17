import argon2 from 'argon2'
import {
	checkUserExists,
	createUser,
	getPasswordHash,
	getUser,
} from '../models/authModels.js'
import type { LoginSchema, SignupSchema } from '../schemas/authSchema.js'
export async function signupService(data: SignupSchema) {
	if (await checkUserExists(data.name)) {
		// TODO: use new Error() instead
		throw { message: 'user already exists.' }
	}
	const passwordHash = await argon2.hash(data.password)
	const user = await createUser({ passwordHash, name: data.name })

	if (!user) throw { message: 'error while creating the account.' }
	// TODO: dont' return user.passwordHash
	return user
}

export async function loginService({ name, password }: LoginSchema) {
	if ((await checkUserExists(name)) === false)
		throw { message: `user ${name} doesn't exist.` }

	const passwordHash = await getPasswordHash(name)
	if (!passwordHash) throw { message: 'password hash not found' }
	if (await argon2.verify(passwordHash, password)) return getUser(name)
	else throw { message: `password does not match.` }
}
