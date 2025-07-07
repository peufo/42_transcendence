import argon2 from 'argon2'
import { checkUserExists, createUser } from '../models/userModels.js'

export async function signupService(
	username: string,
	password: string,
	avatar: string,
) {
	if (await checkUserExists(username)) {
		throw { message: 'user already exists.' }
	}

	const passwordHash = await argon2.hash(password)
	const user = await createUser(username, passwordHash, avatar)

	if (!user) throw { message: 'error while creating the account.' }

	return user
}
