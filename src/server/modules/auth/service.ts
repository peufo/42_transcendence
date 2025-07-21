import argon2 from 'argon2'
import { HttpError } from '../../utils/HttpError.js'
import type { LoginSchema, SignupSchema } from './authSchema.js'
import {
	checkUserExists,
	createUser,
	getPasswordHash,
	getUser,
} from './model.js'

export async function signupService(data: SignupSchema) {
	if (await checkUserExists(data.name)) {
		throw new HttpError('User already exists.', 409)
	}
	const passwordHash = await argon2.hash(data.password)
	const user = await createUser({ passwordHash, name: data.name })

	if (!user) throw new HttpError('Error while creating account.', 500)
	const { passwordHash: _, ...safeUser } = user
	return safeUser
}

export async function loginService({ name, password }: LoginSchema) {
	if ((await checkUserExists(name)) === false)
		throw new HttpError(`User ${name} doesn't exists.`, 404)
	const passwordHash = await getPasswordHash(name)
	if (!passwordHash) throw new HttpError('Password hash not found.', 500)
	if (!(await argon2.verify(passwordHash, password)))
		throw new HttpError('Password is incorrect.', 401)
	return getUser(name)
}
