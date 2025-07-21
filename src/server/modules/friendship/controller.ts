import { getTableColumns, inArray } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { db, users } from '../../db/index.js'
import { getUserFriendsId } from './model.js'

export async function listFriends(_req: FastifyRequest, res: FastifyReply) {
	const user = res.locals?.user
	if (!user) return res.code(401).send()

	const { passwordHash, createdAt, ...columns } = getTableColumns(users)
	const friendsId = await getUserFriendsId(user.id, 'friend')

	const friends = await db
		.select(columns)
		.from(users)
		.where(inArray(users.id, friendsId))

	return res.send({ data: friends })
}
