import { getTableColumns, inArray } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { db, users } from '../../db/index.js'
import { getUserFriendsId } from './model.js'
import { requireUser } from '../../utils/auth.js'
import { HttpError } from '../../utils/HttpError.js'

export async function listFriends(req: FastifyRequest, res: FastifyReply) {
	const user = requireUser(req)

	const { passwordHash, createdAt, ...columns } = getTableColumns(users)

	const friendsId = await getUserFriendsId(user.id, 'friend')
	if (!friendsId.length) {
		throw new HttpError('No friends found', 404)
	}

	const friends = await db
		.select(columns)
		.from(users)
		.where(inArray(users.id, friendsId))

	return res.send({ data: friends })
}

