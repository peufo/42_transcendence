import argon2 from 'argon2'
import {
	checkUserExists,
	createUser,
	getPassword,
	getUser,
} from '../models/authModels.js'
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

export async function loginService(username: string, password: string) {
	if ((await checkUserExists(username)) === false)
		throw { message: `username doesn't exist.` }

	const passwordHash = await getPassword(username)
	if (!passwordHash) throw { message: 'password hash not found' }
	if (await argon2.verify(passwordHash.password, password))
		return getUser(username)
	else throw { message: `password does not match.` }
}
