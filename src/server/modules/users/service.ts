import { HttpError } from '../../utils/HttpError.js'
import { findUsers } from './model.js'

export async function searchUsersService(search: string, userId: number) {
	if (!search || typeof search !== 'string') {
		throw new HttpError('Search term is invalid', 400)
	}

	const users = await findUsers(search, userId)

	return users
}
